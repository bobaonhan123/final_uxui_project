from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.content import GiftCard
from app.schemas.content import GiftCardOut, GiftCardRedeemRequest, GiftCardApplyRequest

router = APIRouter(prefix="/gift-cards", tags=["Gift Cards"])


@router.post("/redeem", response_model=GiftCardOut)
def redeem_gift_card(
    body: GiftCardRedeemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gc = db.query(GiftCard).filter(GiftCard.code == body.code).first()
    if not gc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Gift card not found"
        )
    if not gc.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Gift card is no longer active"
        )
    if gc.current_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Gift card has no balance"
        )
    return gc


@router.post("/apply", response_model=GiftCardOut)
def apply_gift_card(
    body: GiftCardApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gc = (
        db.query(GiftCard)
        .filter(GiftCard.code == body.code, GiftCard.is_active == True)
        .first()
    )
    if not gc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift card not found or inactive",
        )
    if gc.current_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Gift card has no balance"
        )
    order = (
        db.query(Order)
        .filter(
            Order.id == body.order_id,
            Order.user_id == current_user.id,
            Order.status == OrderStatus.PENDING,
        )
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pending order not found"
        )
    if order.gift_card_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already has a gift card applied",
        )

    discount = min(gc.current_balance, order.subtotal + order.insurance_fee)
    gc.current_balance = round(gc.current_balance - discount, 2)
    if gc.current_balance <= 0:
        gc.is_active = False

    order.gift_card_id = gc.id
    order.gift_card_discount = discount
    order.total = round(
        order.subtotal + order.insurance_fee - order.gift_card_discount, 2
    )
    db.commit()
    db.refresh(gc)
    return gc
