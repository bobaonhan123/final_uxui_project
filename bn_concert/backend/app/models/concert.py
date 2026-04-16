import enum

from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    Enum,
    ForeignKey,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Artist(BaseModel):
    __tablename__ = "artists"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    genre: Mapped[str | None] = mapped_column(String(100), nullable=True)
    facebook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instagram_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    spotify_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    x_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    concerts = relationship("Concert", back_populates="artist", lazy="selectin")


class Venue(BaseModel):
    __tablename__ = "venues"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sections = relationship("Section", back_populates="venue", lazy="selectin")
    concerts = relationship("Concert", back_populates="venue", lazy="selectin")


class Section(BaseModel):
    __tablename__ = "sections"

    venue_id: Mapped[str] = mapped_column(String(36), ForeignKey("venues.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    price: Mapped[float] = mapped_column(Float, default=0.0)

    venue = relationship("Venue", back_populates="sections")
    seats = relationship("Seat", back_populates="section", lazy="selectin")


class Seat(BaseModel):
    __tablename__ = "seats"

    section_id: Mapped[str] = mapped_column(String(36), ForeignKey("sections.id"), nullable=False)
    row: Mapped[str] = mapped_column(String(5), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str] = mapped_column(String(10), nullable=False)

    section = relationship("Section", back_populates="seats")
    event_seats = relationship("EventSeat", back_populates="seat", lazy="selectin")


class ConcertStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Concert(BaseModel):
    __tablename__ = "concerts"

    artist_id: Mapped[str] = mapped_column(String(36), ForeignKey("artists.id"), nullable=False)
    venue_id: Mapped[str] = mapped_column(String(36), ForeignKey("venues.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    doors_open: Mapped[str | None] = mapped_column(String(10), nullable=True)
    show_start: Mapped[str | None] = mapped_column(String(10), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    min_price: Mapped[float] = mapped_column(Float, default=0.0)
    max_price: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[ConcertStatus] = mapped_column(
        Enum(ConcertStatus), default=ConcertStatus.UPCOMING
    )
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    artist = relationship("Artist", back_populates="concerts")
    venue = relationship("Venue", back_populates="concerts")
    event_seats = relationship("EventSeat", back_populates="concert", lazy="selectin")


class SeatStatus(str, enum.Enum):
    AVAILABLE = "available"
    HELD = "held"
    SOLD = "sold"


class EventSeat(BaseModel):
    __tablename__ = "event_seats"

    concert_id: Mapped[str] = mapped_column(String(36), ForeignKey("concerts.id"), nullable=False)
    seat_id: Mapped[str] = mapped_column(String(36), ForeignKey("seats.id"), nullable=False)
    status: Mapped[SeatStatus] = mapped_column(Enum(SeatStatus), default=SeatStatus.AVAILABLE)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    held_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    held_until: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

    concert = relationship("Concert", back_populates="event_seats")
    seat = relationship("Seat", back_populates="event_seats")
