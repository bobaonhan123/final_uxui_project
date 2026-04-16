from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import FAQ
from app.schemas.content import FAQOut

router = APIRouter(tags=["FAQ & Support"])


@router.get("/faq", response_model=list[FAQOut])
def list_faqs(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(FAQ).filter(FAQ.is_active == True)
    if category:
        q = q.filter(FAQ.category == category)
    q = q.order_by(FAQ.order.asc())
    faqs = q.all()
    return faqs
