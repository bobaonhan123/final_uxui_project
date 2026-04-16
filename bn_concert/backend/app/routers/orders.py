from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate, OrderOut, PayOrderRequest, TicketOut
from app.services.order_service import create_order, pay_order

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    body: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event_seat_ids = [item.event_seat_id for item in body.items]
    order = create_order(
        db=db,
        user_id=current_user.id,
        concert_id=body.concert_id,
        event_seat_ids=event_seat_ids,
        insurance=body.insurance,
        gift_card_code=body.gift_card_code,
        payment_method=body.payment_method,
        customer_name=body.customer_name,
        customer_phone=body.customer_phone,
        customer_email=body.customer_email,
        customer_address=body.customer_address,
    )
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Order).filter(Order.user_id == current_user.id)
    if status_filter:
        q = q.filter(Order.status == status_filter)
    q = q.order_by(Order.created_at.desc())
    orders = q.offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.post("/{order_id}/pay", response_model=OrderOut)
def pay_for_order(
    order_id: str,
    body: PayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    paid = pay_order(db, order, current_user.id, body)
    return paid


@router.get("/{order_id}/tickets", response_model=list[TicketOut])
def get_order_tickets(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order.tickets


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled",
        )
    from app.models.concert import EventSeat, SeatStatus

    for item in order.items:
        es = db.query(EventSeat).filter(EventSeat.id == item.event_seat_id).first()
        if es and es.status == SeatStatus.HELD:
            es.status = SeatStatus.AVAILABLE
            es.held_by = None
            es.held_until = None
    order.status = OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)
    return order
