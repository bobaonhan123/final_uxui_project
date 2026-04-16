from datetime import datetime

from pydantic import BaseModel, field_validator


class OrderItemCreate(BaseModel):
    event_seat_id: str


class OrderCreate(BaseModel):
    concert_id: str
    items: list[OrderItemCreate]
    insurance: bool = False
    gift_card_code: str | None = None
    payment_method: str | None = "bank_card"
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    customer_address: str | None = None

    @field_validator("items")
    @classmethod
    def max_six_items(cls, v: list) -> list:
        if len(v) > 6:
            raise ValueError("Maximum 6 tickets per order")
        if len(v) == 0:
            raise ValueError("At least 1 ticket required")
        return v


class OrderItemOut(BaseModel):
    id: str
    event_seat_id: str
    price: float
    section_name: str | None = None
    seat_label: str | None = None

    model_config = {"from_attributes": True}


class TicketOut(BaseModel):
    id: str
    order_id: str
    event_seat_id: str
    qr_code: str
    holder_name: str | None = None
    is_used: bool

    model_config = {"from_attributes": True}


class TicketDownloadTokenOut(BaseModel):
    download_token: str
    expires_at: datetime


class OrderCustomerSnapshotOut(BaseModel):
    customer_name: str
    customer_phone: str | None = None
    customer_email: str
    customer_address: str | None = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: str
    user_id: str
    concert_id: str
    status: str
    subtotal: float
    insurance_fee: float
    gift_card_discount: float
    total: float
    payment_method: str | None = None
    customer_snapshot: OrderCustomerSnapshotOut | None = None
    items: list[OrderItemOut] = []
    tickets: list[TicketOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class PayOrderRequest(BaseModel):
    payment_option: str | None = None
    payment_method: str | None = None
    saved_payment_method_id: str | None = None
    card_number: str | None = None
    card_holder_name: str | None = None
    card_expiry: str | None = None
    card_cvv: str | None = None
    ideal_bank: str | None = None
    save_new_card: bool = False
