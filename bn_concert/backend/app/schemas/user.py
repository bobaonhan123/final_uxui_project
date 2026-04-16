from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    country: str | None = None
    avatar_url: str | None = None
    is_verified: bool
    newsletter: bool
    notifications_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    country: str | None = None
    avatar_url: str | None = None
    newsletter: bool | None = None
    notifications_enabled: bool | None = None


class UserSettingsUpdate(BaseModel):
    newsletter: bool | None = None
    notifications_enabled: bool | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str


class PaymentMethodOut(BaseModel):
    id: str
    type: str
    label: str
    last_four: str | None = None
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentMethodCreate(BaseModel):
    type: str = "bank_card"
    label: str
    last_four: str | None = None
    is_default: bool = False
