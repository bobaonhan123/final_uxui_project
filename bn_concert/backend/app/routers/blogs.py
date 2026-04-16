from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.content import Blog, Comment
from app.schemas.content import BlogListOut, BlogDetailOut, CommentOut, CommentCreate

router = APIRouter(prefix="/blogs", tags=["Blogs"])


def _split_tags(tags_value: str | None) -> list[str]:
    if not tags_value:
        return []
    return [tag.strip() for tag in tags_value.split(",") if tag.strip()]


def _get_related_posts(blog: Blog, db: Session, limit: int = 3) -> list[Blog]:
    base_query = db.query(Blog).filter(Blog.is_published == True, Blog.id != blog.id)
    related_posts: list[Blog] = []

    if blog.category:
        related_posts = (
            base_query.filter(Blog.category == blog.category)
            .order_by(Blog.created_at.desc())
            .limit(limit)
            .all()
        )

    related_ids = {item.id for item in related_posts}
    remaining_limit = limit - len(related_posts)
    if remaining_limit <= 0:
        return related_posts

    blog_tags = _split_tags(blog.tags)
    if blog_tags:
        tag_filters = [Blog.tags.ilike(f"%{tag}%") for tag in blog_tags]
        if tag_filters:
            tag_query = base_query.filter(or_(*tag_filters))
            if related_ids:
                tag_query = tag_query.filter(~Blog.id.in_(related_ids))
            tag_matches = tag_query.order_by(Blog.created_at.desc()).limit(remaining_limit).all()
            related_posts.extend(tag_matches)
            related_ids.update(item.id for item in tag_matches)
            remaining_limit = limit - len(related_posts)

    if remaining_limit > 0:
        recent_query = base_query
        if related_ids:
            recent_query = recent_query.filter(~Blog.id.in_(related_ids))
        related_posts.extend(recent_query.order_by(Blog.created_at.desc()).limit(remaining_limit).all())

    return related_posts


@router.get("", response_model=list[BlogListOut])
def list_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Blog).filter(Blog.is_published == True)
    if category:
        q = q.filter(Blog.category == category)
    if search:
        q = q.filter(Blog.title.ilike(f"%{search}%"))
    q = q.order_by(Blog.created_at.desc())
    blogs = q.offset(skip).limit(limit).all()
    return blogs


@router.get("/featured", response_model=BlogListOut)
def get_featured_blog(db: Session = Depends(get_db)):
    featured_blog = (
        db.query(Blog)
        .filter(Blog.is_published == True)
        .order_by(Blog.views.desc(), Blog.created_at.desc())
        .first()
    )
    if not featured_blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Featured blog not found")
    return featured_blog


@router.get("/{slug}", response_model=BlogDetailOut)
def get_blog(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug, Blog.is_published == True).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    blog.views += 1
    db.commit()
    db.refresh(blog)

    approved_comments = [comment for comment in blog.comments if comment.is_approved]
    related_posts = _get_related_posts(blog, db, limit=3)

    response = BlogDetailOut.model_validate(blog)
    response.comments = [CommentOut.model_validate(comment) for comment in approved_comments]
    response.related_posts = [BlogListOut.model_validate(item) for item in related_posts]
    return response


@router.get("/{slug}/comments", response_model=list[CommentOut])
def get_blog_comments(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    comments = (
        db.query(Comment)
        .filter(Comment.blog_id == blog.id, Comment.is_approved == True)
        .order_by(Comment.created_at.desc())
        .all()
    )
    return comments


@router.post(
    "/{slug}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    slug: str,
    body: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found")
    comment = Comment(
        blog_id=blog.id,
        user_id=current_user.id,
        author_name=f"{current_user.first_name} {current_user.last_name}",
        content=body.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
