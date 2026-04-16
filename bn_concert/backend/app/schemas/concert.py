from enum import Enum
from datetime import datetime

from pydantic import BaseModel, Field


class ArtistOut(BaseModel):
    id: str
    name: str
    slug: str
    bio: str | None = None
    image_url: str | None = None
    genre: str | None = None
    facebook_url: str | None = None
    instagram_url: str | None = None
    spotify_url: str | None = None
    x_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtistVideoOut(BaseModel):
    id: str
    title: str
    collection: str | None = None
    thumbnail_url: str | None = None
    video_url: str | None = None
    views_label: str | None = None
    published_label: str | None = None
    duration_label: str | None = None


class ArtistDetailOut(ArtistOut):
    tour_name: str | None = None
    image_gallery: list[str] = Field(default_factory=list)
    video_gallery: list[ArtistVideoOut] = Field(default_factory=list)


class VenueOut(BaseModel):
    id: str
    name: str
    address: str | None = None
    city: str | None = None
    country: str | None = None
    capacity: int
    image_url: str | None = None

    model_config = {"from_attributes": True}


class SectionOut(BaseModel):
    id: str
    name: str
    color: str | None = None
    price: float

    model_config = {"from_attributes": True}


class SeatOut(BaseModel):
    id: str
    row: str
    number: int
    label: str

    model_config = {"from_attributes": True}


class EventSeatOut(BaseModel):
    id: str
    concert_id: str
    seat_id: str
    status: str
    price: float
    seat: SeatOut | None = None
    section_name: str | None = None

    model_config = {"from_attributes": True}


class ConcertListOut(BaseModel):
    id: str
    title: str
    date: datetime
    image_url: str | None = None
    min_price: float
    max_price: float
    status: str
    is_featured: bool
    artist: ArtistOut | None = None
    venue: VenueOut | None = None

    model_config = {"from_attributes": True}


class ConcertDetailOut(ConcertListOut):
    description: str | None = None
    doors_open: str | None = None
    show_start: str | None = None

    model_config = {"from_attributes": True}


class ConcertDateRange(str, Enum):
    THIS_WEEK = "this_week"
    THIS_MONTH = "this_month"
    NEXT_3_MONTHS = "next_3_months"


class ConcertFiltersOut(BaseModel):
    genres: list[str]
    locations: list[str]


class SectionWithSeatsOut(SectionOut):
    available_count: int = 0
    total_count: int = 0

    model_config = {"from_attributes": True}
