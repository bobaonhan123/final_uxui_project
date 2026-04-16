from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class BlogListOut(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str | None = None
    image_url: str | None = None
    author_name: str | None = None
    category: str | None = None
    tags: list[str] = Field(default_factory=list)
    views: int
    created_at: datetime

    @field_validator("tags", mode="before")
    @classmethod
    def parse_tags(cls, value: str | list[str] | None):
        if value is None:
            return []
        if isinstance(value, list):
            return [tag.strip().lstrip("#") for tag in value if tag and tag.strip()]
        if isinstance(value, str):
            return [tag.strip().lstrip("#") for tag in value.split(",") if tag.strip()]
        return []

    model_config = {"from_attributes": True}


class CommentOut(BaseModel):
    id: str
    author_name: str | None = None
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BlogDetailOut(BlogListOut):
    content: str | None = None
    comments: list[CommentOut] = Field(default_factory=list)
    related_posts: list[BlogListOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str


class FAQOut(BaseModel):
    id: str
    question: str
    answer: str
    category: str | None = None
    order: int

    model_config = {"from_attributes": True}


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    message: str
    reference: str
    created_at: datetime


class GiftCardOut(BaseModel):
    id: str
    code: str
    original_balance: float
    current_balance: float
    is_active: bool

    model_config = {"from_attributes": True}


class GiftCardRedeemRequest(BaseModel):
    code: str


class GiftCardApplyRequest(BaseModel):
    code: str
    order_id: str
