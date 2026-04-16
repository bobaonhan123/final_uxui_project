from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, ensure_user_profile_columns

from app.models.user import User, PaymentMethod
from app.models.auth_code import AuthCode
from app.models.concert import Artist, Venue, Section, Seat, Concert, EventSeat
from app.models.order import Order, OrderItem, Ticket
from app.models.content import Blog, Comment, FAQ, GiftCard, SupportContact

from app.routers import auth, users, concerts, artists, orders, gift_cards, blogs, faq, support, tickets


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_user_profile_columns()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(concerts.router, prefix="/api")
app.include_router(artists.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(gift_cards.router, prefix="/api")
app.include_router(blogs.router, prefix="/api")
app.include_router(faq.router, prefix="/api")
app.include_router(support.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
