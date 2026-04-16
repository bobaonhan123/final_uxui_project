import uuid
from datetime import datetime, timedelta, timezone
import re

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.concert import EventSeat, SeatStatus
from app.models.order import (
    Order,
    OrderCustomerSnapshot,
    OrderItem,
    OrderStatus,
    Ticket,
)
from app.models.content import GiftCard
from app.models.user import PaymentMethod, PaymentMethodType, User
from app.schemas.order import PayOrderRequest

HOLD_DURATION_MINUTES = 10
INSURANCE_RATE = 0.05


def hold_seats(
    db: Session, user_id: str, concert_id: str, event_seat_ids: list[str]
) -> list[EventSeat]:
    now = datetime.now(timezone.utc)
    seats: list[EventSeat] = []
    for es_id in event_seat_ids:
        es = db.query(EventSeat).filter(EventSeat.id == es_id).first()
        if not es:
            raise HTTPException(status_code=404, detail=f"Event seat {es_id} not found")
        if es.concert_id != concert_id:
            raise HTTPException(
                status_code=400,
                detail=f"Seat {es_id} does not belong to this concert",
            )
        if es.status == SeatStatus.SOLD:
            raise HTTPException(
                status_code=409, detail=f"Seat {es.seat.label} is already sold"
            )
        if es.status == SeatStatus.HELD and es.held_by != user_id:
            if es.held_until and es.held_until > now:
                raise HTTPException(
                    status_code=409,
                    detail=f"Seat {es.seat.label} is held by another user",
                )
        es.status = SeatStatus.HELD
        es.held_by = user_id
        es.held_until = now + timedelta(minutes=HOLD_DURATION_MINUTES)
        seats.append(es)
    db.commit()
    return seats


def release_expired_holds(db: Session) -> int:
    now = datetime.now(timezone.utc)
    expired = (
        db.query(EventSeat)
        .filter(
            EventSeat.status == SeatStatus.HELD,
            EventSeat.held_until < now,
        )
        .all()
    )
    for es in expired:
        es.status = SeatStatus.AVAILABLE
        es.held_by = None
        es.held_until = None
    db.commit()
    return len(expired)


def create_order(
    db: Session,
    user_id: str,
    concert_id: str,
    event_seat_ids: list[str],
    insurance: bool = False,
    gift_card_code: str | None = None,
    payment_method: str | None = "bank_card",
    customer_name: str | None = None,
    customer_phone: str | None = None,
    customer_email: str | None = None,
    customer_address: str | None = None,
) -> Order:
    release_expired_holds(db)
    seats = hold_seats(db, user_id, concert_id, event_seat_ids)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    subtotal = sum(s.price for s in seats)
    insurance_fee = round(subtotal * INSURANCE_RATE, 2) if insurance else 0.0
    gift_card_discount = 0.0
    gift_card_id = None

    if gift_card_code:
        gc = (
            db.query(GiftCard)
            .filter(GiftCard.code == gift_card_code, GiftCard.is_active == True)
            .first()
        )
        if not gc:
            raise HTTPException(status_code=404, detail="Gift card not found or inactive")
        if gc.current_balance <= 0:
            raise HTTPException(status_code=400, detail="Gift card has no remaining balance")
        gift_card_discount = min(gc.current_balance, subtotal + insurance_fee)
        gc.current_balance = round(gc.current_balance - gift_card_discount, 2)
        if gc.current_balance <= 0:
            gc.is_active = False
        gift_card_id = gc.id

    total = round(subtotal + insurance_fee - gift_card_discount, 2)

    order = Order(
        user_id=user_id,
        concert_id=concert_id,
        status=OrderStatus.PENDING,
        subtotal=subtotal,
        insurance_fee=insurance_fee,
        gift_card_discount=gift_card_discount,
        total=total,
        payment_method=payment_method,
        gift_card_id=gift_card_id,
    )
    db.add(order)
    db.flush()

    fallback_address = ", ".join(
        part for part in [user.address, user.city, user.country] if part
    )
    resolved_name = (customer_name or "").strip() or f"{user.first_name} {user.last_name}".strip()
    resolved_email = (customer_email or "").strip() or user.email

    if not resolved_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer name is required",
        )
    if not resolved_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer email is required",
        )

    db.add(
        OrderCustomerSnapshot(
            order_id=order.id,
            customer_name=resolved_name,
            customer_phone=(customer_phone or "").strip() or user.phone,
            customer_email=resolved_email,
            customer_address=(customer_address or "").strip() or fallback_address or None,
        )
    )

    for es in seats:
        section_name = es.seat.section.name if es.seat and es.seat.section else None
        seat_label = es.seat.label if es.seat else None
        item = OrderItem(
            order_id=order.id,
            event_seat_id=es.id,
            price=es.price,
            section_name=section_name,
            seat_label=seat_label,
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return order


def _normalize_payment_option(body: PayOrderRequest) -> tuple[str, str | None]:
    raw_option = (body.payment_option or body.payment_method or "").strip().lower()
    resolved_saved_payment_method_id = body.saved_payment_method_id

    if raw_option.startswith("saved_card:"):
        _, _, parsed_id = raw_option.partition(":")
        resolved_saved_payment_method_id = resolved_saved_payment_method_id or parsed_id
        raw_option = "saved_card"

    normalized = {
        "bank_card": "new_card",
        "card": "new_card",
        "visa": "new_card",
        "mastercard": "new_card",
        "ideal": "ideal",
        "saved_card": "saved_card",
        "new_card": "new_card",
    }.get(raw_option, raw_option)

    return normalized, resolved_saved_payment_method_id


def _assert_order_holds_are_active(
    db: Session,
    order: Order,
    user_id: str,
) -> list[EventSeat]:
    now = datetime.now(timezone.utc)
    held_seats: list[EventSeat] = []

    for item in order.items:
        es = db.query(EventSeat).filter(EventSeat.id == item.event_seat_id).first()
        if not es:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seat information is missing for this order",
            )
        if es.status == SeatStatus.SOLD:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat {es.seat.label if es.seat else es.id} is already sold",
            )

        is_expired = not es.held_until or es.held_until <= now
        if es.status != SeatStatus.HELD or es.held_by != user_id or is_expired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Seat hold has expired. Please reselect your tickets.",
            )
        held_seats.append(es)

    return held_seats


def _mark_payment_failed(
    db: Session,
    order: Order,
    held_seats: list[EventSeat],
    detail: str,
) -> None:
    now = datetime.now(timezone.utc)
    order.status = OrderStatus.FAILED
    for es in held_seats:
        es.status = SeatStatus.HELD
        es.held_by = order.user_id
        es.held_until = now + timedelta(minutes=HOLD_DURATION_MINUTES)

    db.commit()
    db.refresh(order)
    raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=detail)


def pay_order(
    db: Session,
    order: Order,
    user_id: str,
    payment_request: PayOrderRequest,
) -> Order:
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not your order")

    if order.status == OrderStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already paid",
        )
    if order.status not in (OrderStatus.PENDING, OrderStatus.FAILED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or failed orders can be paid",
        )

    held_seats = _assert_order_holds_are_active(db, order, user_id)
    payment_option, resolved_saved_payment_method_id = _normalize_payment_option(
        payment_request
    )

    normalized_payment_method: str
    should_decline_payment = False
    pending_saved_card: tuple[str, str, bool] | None = None

    if payment_option == "saved_card":
        if not resolved_saved_payment_method_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Select a saved card before paying",
            )
        saved_method = (
            db.query(PaymentMethod)
            .filter(
                PaymentMethod.id == resolved_saved_payment_method_id,
                PaymentMethod.user_id == user_id,
                PaymentMethod.type == PaymentMethodType.BANK_CARD,
            )
            .first()
        )
        if not saved_method:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Saved card not found",
            )
        last_four = saved_method.last_four or "9999"
        normalized_payment_method = f"saved_card_{last_four}"
        should_decline_payment = last_four == "0000"
    elif payment_option == "new_card":
        card_number = re.sub(r"\D", "", payment_request.card_number or "")
        card_holder = (payment_request.card_holder_name or "").strip()
        card_expiry = (payment_request.card_expiry or "").strip()
        card_cvv = (payment_request.card_cvv or "").strip()

        if not re.fullmatch(r"\d{13,19}", card_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid card number",
            )
        if not card_holder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Card holder name is required",
            )
        if not re.fullmatch(r"\d{2}/\d{2}", card_expiry):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Card expiry must be in MM/YY format",
            )
        if not re.fullmatch(r"\d{3,4}", card_cvv):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid CVV",
            )

        last_four = card_number[-4:]
        normalized_payment_method = f"new_card_{last_four}"
        should_decline_payment = card_number.endswith("0000") or card_cvv == "000"

        if payment_request.save_new_card:
            has_default_method = (
                db.query(PaymentMethod)
                .filter(
                    PaymentMethod.user_id == user_id,
                    PaymentMethod.is_default == True,
                )
                .first()
                is not None
            )
            new_label = f"{card_holder} •••• {last_four}"
            pending_saved_card = (last_four, new_label, not has_default_method)
    elif payment_option == "ideal":
        ideal_bank = (payment_request.ideal_bank or "").strip()
        if not ideal_bank:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Choose a bank for iDeal payment",
            )
        normalized_payment_method = "ideal"
        should_decline_payment = ideal_bank.lower() == "test-fail-bank"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported payment method. Use saved_card, new_card, or ideal.",
        )

    order.payment_method = normalized_payment_method
    if should_decline_payment:
        _mark_payment_failed(
            db,
            order,
            held_seats,
            "Payment was declined. Please retry or change payment method.",
        )

    if pending_saved_card:
        last_four, label, is_default = pending_saved_card
        already_saved = (
            db.query(PaymentMethod)
            .filter(
                PaymentMethod.user_id == user_id,
                PaymentMethod.type == PaymentMethodType.BANK_CARD,
                PaymentMethod.last_four == last_four,
                PaymentMethod.label == label,
            )
            .first()
        )
        if not already_saved:
            db.add(
                PaymentMethod(
                    user_id=user_id,
                    type=PaymentMethodType.BANK_CARD,
                    label=label,
                    last_four=last_four,
                    is_default=is_default,
                )
            )

    order.status = OrderStatus.PAID
    user = order.user

    for item, es in zip(order.items, held_seats):
        es.status = SeatStatus.SOLD
        es.held_by = None
        es.held_until = None

        ticket = Ticket(
            order_id=order.id,
            event_seat_id=item.event_seat_id,
            qr_code=f"TKT-{uuid.uuid4().hex[:16].upper()}",
            holder_name=f"{user.first_name} {user.last_name}" if user else None,
        )
        db.add(ticket)

    db.commit()
    db.refresh(order)
    return order
