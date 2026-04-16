from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_user_profile_columns():
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    dialect = engine.dialect.name
    bool_default_true = "TRUE" if dialect == "postgresql" else "1"
    bool_default_false = "FALSE" if dialect == "postgresql" else "0"
    column_definitions: dict[str, str] = {
        "phone": "VARCHAR(20)",
        "date_of_birth": "DATE",
        "gender": "VARCHAR(50)",
        "address": "VARCHAR(255)",
        "city": "VARCHAR(100)",
        "state": "VARCHAR(100)",
        "zip_code": "VARCHAR(20)",
        "country": "VARCHAR(100)",
        "avatar_url": "VARCHAR(500)",
        "is_verified": f"BOOLEAN NOT NULL DEFAULT {bool_default_false}",
        "is_active": f"BOOLEAN NOT NULL DEFAULT {bool_default_true}",
        "newsletter": f"BOOLEAN NOT NULL DEFAULT {bool_default_false}",
        "notifications_enabled": f"BOOLEAN NOT NULL DEFAULT {bool_default_true}",
    }

    with engine.begin() as connection:
        for column_name, column_definition in column_definitions.items():
            if column_name in existing_columns:
                continue
            connection.execute(
                text(f"ALTER TABLE users ADD COLUMN {column_name} {column_definition}")
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
