from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.concert import Concert
from app.models.order import Order, OrderStatus, Ticket
from app.models.user import User
from app.schemas.order import TicketDownloadTokenOut
from app.services.auth_service import create_ticket_download_token, decode_token

router = APIRouter(prefix="/tickets", tags=["Tickets"])
DOWNLOAD_TOKEN_TTL = timedelta(minutes=5)


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_simple_pdf(lines: list[str]) -> bytes:
    content_lines = ["BT", "/F1 12 Tf", "50 770 Td"]
    for idx, line in enumerate(lines):
        if idx > 0:
            content_lines.append("0 -18 Td")
        content_lines.append(f"({_escape_pdf_text(line)}) Tj")
    content_lines.append("ET")
    content_stream = "\n".join(content_lines).encode("latin-1", errors="replace")

    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length %d >>\nstream\n%s\nendstream" % (len(content_stream), content_stream),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    pdf_bytes = b"%PDF-1.4\n"
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf_bytes))
        pdf_bytes += f"{index} 0 obj\n".encode("ascii") + obj + b"\nendobj\n"

    xref_start = len(pdf_bytes)
    pdf_bytes += f"xref\n0 {len(objects) + 1}\n".encode("ascii")
    pdf_bytes += b"0000000000 65535 f \n"
    for offset in offsets[1:]:
        pdf_bytes += f"{offset:010d} 00000 n \n".encode("ascii")
    pdf_bytes += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF".encode(
            "ascii"
        )
    )
    return pdf_bytes


def _format_datetime(value: datetime | None) -> str:
    if value is None:
        return "N/A"
    if value.tzinfo is None:
        return value.strftime("%b %d, %Y %H:%M")
    return value.astimezone(timezone.utc).strftime("%b %d, %Y %H:%M UTC")


def _format_payment_method(payment_method: str | None) -> str:
    if not payment_method:
        return "N/A"
    normalized = payment_method.lower()
    if normalized == "ideal":
        return "iDeal"
    if normalized.startswith("saved_card_"):
        return f"Saved card ending {payment_method[-4:]}"
    if normalized.startswith("new_card_"):
        return f"Card ending {payment_method[-4:]}"
    return payment_method.replace("_", " ").title()


def _get_owned_ticket(db: Session, ticket_id: str, user_id: str) -> Ticket | None:
    return (
        db.query(Ticket)
        .join(Order, Ticket.order_id == Order.id)
        .filter(Ticket.id == ticket_id, Order.user_id == user_id)
        .first()
    )


def _resolve_user_from_download_token(ticket_id: str, token: str) -> str:
    payload = decode_token(token)
    if payload is None or payload.get("type") != "ticket_download":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired download token",
        )

    user_id: str | None = payload.get("sub")
    token_ticket_id: str | None = payload.get("ticket_id")
    if not user_id or token_ticket_id != ticket_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Download token does not match ticket",
        )
    return user_id


@router.post("/{ticket_id}/download-token", response_model=TicketDownloadTokenOut)
def mint_ticket_download_token(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = _get_owned_ticket(db, ticket_id, current_user.id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if ticket.order.status != OrderStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-ticket is only available for paid orders",
        )

    expires_at = datetime.now(timezone.utc) + DOWNLOAD_TOKEN_TTL
    download_token = create_ticket_download_token(
        {"sub": current_user.id, "ticket_id": ticket.id},
        expires_delta=DOWNLOAD_TOKEN_TTL,
    )
    return TicketDownloadTokenOut(download_token=download_token, expires_at=expires_at)


@router.get("/{ticket_id}/download")
def download_ticket(
    ticket_id: str,
    token: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    user_id = _resolve_user_from_download_token(ticket_id, token)
    ticket = _get_owned_ticket(db, ticket_id, user_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    order = ticket.order
    if order.status != OrderStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-ticket is only available for paid orders",
        )

    concert = db.query(Concert).filter(Concert.id == order.concert_id).first()
    matching_item = next(
        (item for item in order.items if item.event_seat_id == ticket.event_seat_id),
        None,
    )
    seat_label = (
        matching_item.seat_label
        if matching_item and matching_item.seat_label
        else (ticket.event_seat.seat.label if ticket.event_seat and ticket.event_seat.seat else "N/A")
    )
    row_label = "".join(ch for ch in seat_label if ch.isalpha()) or "N/A"
    section_name = (
        matching_item.section_name
        if matching_item and matching_item.section_name
        else (
            ticket.event_seat.seat.section.name
            if ticket.event_seat and ticket.event_seat.seat and ticket.event_seat.seat.section
            else "General"
        )
    )

    ticket_price = matching_item.price if matching_item else 0.0
    customer = order.customer_snapshot
    artist_name = concert.artist.name if concert and concert.artist else "N/A"
    venue_name = concert.venue.name if concert and concert.venue else "N/A"
    concert_title = concert.title if concert else f"Concert {order.concert_id[:8]}"

    lines = [
        "BNConcert E-Ticket",
        f"Ticket ID: {ticket.id}",
        f"Order ID: {order.id}",
        f"Artist: {artist_name}",
        f"Concert: {concert_title}",
        f"Venue: {venue_name}",
        f"Concert Date: {_format_datetime(concert.date if concert else None)}",
        f"Section: {section_name}",
        f"Row: {row_label}",
        f"Seat: {seat_label}",
        f"Price: ${ticket_price:.2f}",
        f"Holder: {ticket.holder_name or customer.customer_name if customer else 'N/A'}",
        f"QR Code: {ticket.qr_code}",
        f"Payment: {_format_payment_method(order.payment_method)} (${order.total:.2f})",
        f"Customer Email: {customer.customer_email if customer else (order.user.email if order.user else 'N/A')}",
        f"Issued At: {_format_datetime(datetime.now(timezone.utc))}",
    ]

    pdf_content = _build_simple_pdf(lines)
    filename = f"bnconcert-ticket-{ticket.id[:8]}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
