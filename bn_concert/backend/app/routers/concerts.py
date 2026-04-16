from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.concert import Artist, Concert, EventSeat, SeatStatus, Section, Venue
from app.schemas.concert import (
    ConcertDateRange,
    ConcertDetailOut,
    ConcertFiltersOut,
    EventSeatOut,
    ConcertListOut,
    SectionWithSeatsOut,
)

router = APIRouter(prefix="/concerts", tags=["Concerts"])


@router.get("", response_model=list[ConcertListOut])
def list_concerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(8, ge=1, le=100),
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    featured: bool | None = None,
    artist_id: str | None = None,
    genre: str | None = None,
    date_range: ConcertDateRange | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Concert).options(joinedload(Concert.artist), joinedload(Concert.venue))
    if search:
        q = q.filter(Concert.title.ilike(f"%{search}%"))
    if status_filter:
        q = q.filter(Concert.status == status_filter)
    if featured is not None:
        q = q.filter(Concert.is_featured == featured)
    if artist_id:
        q = q.filter(Concert.artist_id == artist_id)
    if genre:
        q = q.join(Concert.artist).filter(Artist.genre.ilike(f"%{genre}%"))
    if location:
        q = q.join(Concert.venue).filter(
            or_(
                Venue.city.ilike(f"%{location}%"),
                Venue.name.ilike(f"%{location}%"),
                Venue.country.ilike(f"%{location}%"),
            )
        )
    if date_range:
        now = datetime.now(timezone.utc)
        if date_range == ConcertDateRange.THIS_WEEK:
            q = q.filter(Concert.date >= now, Concert.date <= now + timedelta(days=7))
        elif date_range == ConcertDateRange.THIS_MONTH:
            q = q.filter(Concert.date >= now, Concert.date <= now + timedelta(days=30))
        elif date_range == ConcertDateRange.NEXT_3_MONTHS:
            q = q.filter(Concert.date >= now, Concert.date <= now + timedelta(days=90))
    q = q.order_by(Concert.date.asc())
    concerts = q.offset(skip).limit(limit).all()
    return concerts


@router.get("/filters", response_model=ConcertFiltersOut)
def get_concert_filters(db: Session = Depends(get_db)):
    genres = [
        row[0]
        for row in (
            db.query(Artist.genre)
            .join(Concert, Concert.artist_id == Artist.id)
            .filter(Artist.genre.isnot(None), Artist.genre != "")
            .distinct()
            .order_by(Artist.genre.asc())
            .all()
        )
        if row[0]
    ]
    locations = [
        row[0]
        for row in (
            db.query(Venue.city)
            .join(Concert, Concert.venue_id == Venue.id)
            .filter(Venue.city.isnot(None), Venue.city != "")
            .distinct()
            .order_by(Venue.city.asc())
            .all()
        )
        if row[0]
    ]
    return ConcertFiltersOut(genres=genres, locations=locations)


@router.get("/{concert_id}", response_model=ConcertDetailOut)
def get_concert(concert_id: str, db: Session = Depends(get_db)):
    concert = (
        db.query(Concert)
        .options(joinedload(Concert.artist), joinedload(Concert.venue))
        .filter(Concert.id == concert_id)
        .first()
    )
    if not concert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concert not found")
    return concert


@router.get("/{concert_id}/dates", response_model=list[ConcertListOut])
def get_concert_dates(concert_id: str, db: Session = Depends(get_db)):
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concert not found")
    
    # Return dates for the same artist at the same or different venues (maybe just same artist)
    dates = (
        db.query(Concert)
        .options(joinedload(Concert.artist), joinedload(Concert.venue))
        .filter(Concert.artist_id == concert.artist_id)
        .filter(Concert.status == "upcoming")
        .order_by(Concert.date.asc())
        .all()
    )
    return dates

@router.get("/{concert_id}/sections", response_model=list[SectionWithSeatsOut])
def get_concert_sections(concert_id: str, db: Session = Depends(get_db)):
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concert not found")

    sections = (
        db.query(Section)
        .filter(Section.venue_id == concert.venue_id)
        .all()
    )
    result = []
    for section in sections:
        seat_ids = [s.id for s in section.seats]
        total = len(seat_ids)
        available = (
            db.query(EventSeat)
            .filter(
                EventSeat.concert_id == concert_id,
                EventSeat.seat_id.in_(seat_ids),
                EventSeat.status == SeatStatus.AVAILABLE,
            )
            .count()
            if seat_ids
            else 0
        )
        result.append(
            SectionWithSeatsOut(
                id=section.id,
                name=section.name,
                color=section.color,
                price=section.price,
                available_count=available,
                total_count=total,
            )
        )
    return result


@router.get("/{concert_id}/sections/{section_id}/seats", response_model=list[EventSeatOut])
def get_section_seats(
    concert_id: str,
    section_id: str,
    db: Session = Depends(get_db),
):
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    seat_ids = [s.id for s in section.seats]
    if not seat_ids:
        return []

    event_seats = (
        db.query(EventSeat)
        .options(joinedload(EventSeat.seat))
        .filter(
            EventSeat.concert_id == concert_id,
            EventSeat.seat_id.in_(seat_ids),
        )
        .all()
    )
    result = []
    for es in event_seats:
        result.append(
            EventSeatOut(
                id=es.id,
                concert_id=es.concert_id,
                seat_id=es.seat_id,
                status=es.status.value,
                price=es.price,
                seat=es.seat,
                section_name=section.name,
            )
        )
    return result
