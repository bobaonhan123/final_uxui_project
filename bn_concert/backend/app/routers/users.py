from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, PaymentMethod, PaymentMethodType
from app.schemas.user import (
    UserOut,
    UserUpdate,
    ChangePasswordRequest,
    PaymentMethodOut,
    PaymentMethodCreate,
    UserSettingsUpdate,
)
from app.services.auth_service import verify_password, hash_password, get_password_strength_error

router = APIRouter(prefix="/users", tags=["Users"])


def _normalize_payment_method_type(raw_type: str | None) -> PaymentMethodType:
    normalized = (raw_type or "").strip().lower()
    if normalized in {"bank_card", "card", "visa", "mastercard"}:
        return PaymentMethodType.BANK_CARD
    if normalized == "ideal":
        return PaymentMethodType.IDEAL
    if normalized == "paypal":
        return PaymentMethodType.PAYPAL
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported payment method type",
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = body.model_dump(exclude_unset=True)

    if "email" in update_data and body.email is not None:
        normalized_email = str(body.email).strip().lower()
        if normalized_email != current_user.email:
            email_in_use = (
                db.query(User)
                .filter(
                    func.lower(User.email) == normalized_email,
                    User.id != current_user.id,
                )
                .first()
            )
            if email_in_use:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )
        current_user.email = normalized_email

    update_data.pop("email", None)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/settings", response_model=UserOut)
def update_settings(
    body: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.newsletter is not None:
        current_user.newsletter = body.newsletter
    if body.notifications_enabled is not None:
        current_user.notifications_enabled = body.notifications_enabled

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
@router.put("/me/password")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.new_password != body.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm password do not match",
        )

    password_error = get_password_strength_error(body.new_password)
    if password_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error,
        )

    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if verify_password(body.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )
    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.is_active = False
    db.commit()
    return {"message": "Account deactivated"}


@router.get("/me/payment-methods", response_model=list[PaymentMethodOut])
def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    methods = (
        db.query(PaymentMethod)
        .filter(PaymentMethod.user_id == current_user.id)
        .all()
    )
    return methods


@router.post(
    "/me/payment-methods",
    response_model=PaymentMethodOut,
    status_code=status.HTTP_201_CREATED,
)
def add_payment_method(
    body: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    method_type = _normalize_payment_method_type(body.type)

    if body.is_default:
        db.query(PaymentMethod).filter(
            PaymentMethod.user_id == current_user.id
        ).update({"is_default": False})

    pm = PaymentMethod(
        user_id=current_user.id,
        type=method_type,
        label=body.label,
        last_four=body.last_four,
        is_default=body.is_default,
    )
    db.add(pm)
    db.commit()
    db.refresh(pm)
    return pm


@router.delete("/me/payment-methods/{method_id}")
def delete_payment_method(
    method_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pm = (
        db.query(PaymentMethod)
        .filter(PaymentMethod.id == method_id, PaymentMethod.user_id == current_user.id)
        .first()
    )
    if not pm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment method not found")
    db.delete(pm)
    db.commit()
    return {"message": "Payment method deleted"}
