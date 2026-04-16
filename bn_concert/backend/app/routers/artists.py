import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.concert import Artist, Concert
from app.schemas.concert import ArtistOut, ArtistDetailOut, ArtistVideoOut, ConcertListOut

router = APIRouter(prefix="/artists", tags=["Artists"])


@router.get("", response_model=list[ArtistOut])
def list_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    artists = db.query(Artist).offset(skip).limit(limit).all()
    return artists


@router.get("/{artist_id}", response_model=ArtistDetailOut)
def get_artist(artist_id: str, db: Session = Depends(get_db)):
    artist = (
        db.query(Artist)
        .options(joinedload(Artist.concerts).joinedload(Concert.venue))
        .filter(Artist.id == artist_id)
        .first()
    )
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    sorted_concerts = sorted(artist.concerts, key=lambda concert: concert.date)
    tour_name = None
    if sorted_concerts:
        title_match = re.search(r"—\s*(.+?)(?:\s*\(|$)", sorted_concerts[0].title)
        if title_match:
            tour_name = title_match.group(1).strip()

    if not tour_name:
        tour_name = f"{artist.name} World Tour"

    image_gallery: list[str] = []
    for concert in sorted_concerts:
        if concert.image_url and concert.image_url not in image_gallery:
            image_gallery.append(concert.image_url)
    image_gallery = image_gallery[:6]

    fallback_video_url = (
        artist.spotify_url
        or artist.instagram_url
        or artist.facebook_url
        or artist.x_url
    )
    video_gallery = [
        ArtistVideoOut(
            id=f"{artist.id}-video-{index + 1}",
            title=f"{artist.name} Greatest Hits {concert.date.year}",
            collection=tour_name,
            thumbnail_url=concert.image_url,
            video_url=fallback_video_url,
            views_label=f"{(index + 2) * 8}K views",
            published_label=f"{index + 1} month{'s' if index > 0 else ''} ago",
            duration_label=f"{50 + index}:4{index}",
        )
        for index, concert in enumerate(sorted_concerts[:4])
        if concert.image_url
    ]

    artist_data = ArtistOut.model_validate(artist).model_dump()
    return ArtistDetailOut(
        **artist_data,
        tour_name=tour_name,
        image_gallery=image_gallery,
        video_gallery=video_gallery,
    )


@router.get("/{artist_id}/concerts", response_model=list[ConcertListOut])
def get_artist_concerts(artist_id: str, db: Session = Depends(get_db)):
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    concerts = (
        db.query(Concert)
        .options(joinedload(Concert.artist), joinedload(Concert.venue))
        .filter(Concert.artist_id == artist_id)
        .order_by(Concert.date.asc())
        .all()
    )
    return concerts
