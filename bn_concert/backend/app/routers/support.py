from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import SupportContact
from app.schemas.content import ContactRequest, ContactResponse

router = APIRouter(prefix="/support", tags=["Support"])


@router.post("/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def contact_support(
    body: ContactRequest,
    db: Session = Depends(get_db),
):
    support_contact = SupportContact(
        name=body.name.strip(),
        email=body.email.strip().lower(),
        subject=body.subject.strip(),
        message=body.message.strip(),
    )
    db.add(support_contact)
    db.commit()
    db.refresh(support_contact)

    return ContactResponse(
        message="Your message has been received. We will get back to you soon.",
        reference=f"SUP-{support_contact.id[:8].upper()}",
        created_at=support_contact.created_at,
    )
