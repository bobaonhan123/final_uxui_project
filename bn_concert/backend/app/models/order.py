import enum

from sqlalchemy import String, Integer, Float, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Order(BaseModel):
    __tablename__ = "orders"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    concert_id: Mapped[str] = mapped_column(String(36), ForeignKey("concerts.id"), nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.PENDING
    )
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    insurance_fee: Mapped[float] = mapped_column(Float, default=0.0)
    gift_card_discount: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    payment_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gift_card_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gift_cards.id"), nullable=True
    )

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", lazy="selectin")
    tickets = relationship("Ticket", back_populates="order", lazy="selectin")
    customer_snapshot = relationship(
        "OrderCustomerSnapshot",
        back_populates="order",
        uselist=False,
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class OrderCustomerSnapshot(BaseModel):
    __tablename__ = "order_customer_snapshots"

    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id"), nullable=False, unique=True
    )
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    customer_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_address: Mapped[str | None] = mapped_column(Text, nullable=True)

    order = relationship("Order", back_populates="customer_snapshot")


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"), nullable=False)
    event_seat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("event_seats.id"), nullable=False
    )
    price: Mapped[float] = mapped_column(Float, default=0.0)
    section_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    seat_label: Mapped[str | None] = mapped_column(String(20), nullable=True)

    order = relationship("Order", back_populates="items")
    event_seat = relationship("EventSeat")


class Ticket(BaseModel):
    __tablename__ = "tickets"

    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"), nullable=False)
    event_seat_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("event_seats.id"), nullable=False
    )
    qr_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    holder_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    order = relationship("Order", back_populates="tickets")
    event_seat = relationship("EventSeat")
