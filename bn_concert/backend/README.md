# BNConcert API (Backend)

FastAPI + SQLAlchemy backend for the BNConcert mobile app.

## Prerequisites

- **Python** >= 3.10
- **uv** (Python package manager) — [Install uv](https://docs.astral.sh/uv/getting-started/installation/)

## Setup

```bash
# Navigate to backend directory
cd bn_concert/backend

# Install dependencies
uv sync

# Create .env file (or edit the existing one)
cp .env.example .env
```

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./bnconcert.db` | Database connection string. Use `postgresql://user:pass@host/db` for Postgres |
| `SECRET_KEY` | `bnconcert-dev-secret-key-change-in-prod` | JWT signing key — **change in production** |
| `LAN_IP` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated) |
| `SMTP_HOST` | _(empty)_ | SMTP host for auth emails (verification/reset) |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USERNAME` | _(empty)_ | SMTP username (optional if server allows anonymous send) |
| `SMTP_PASSWORD` | _(empty)_ | SMTP password |
| `SMTP_FROM_EMAIL` | _(empty)_ | From address used in auth emails |
| `SMTP_USE_TLS` | `true` | Enable STARTTLS |

## Run

```bash
# Start the development server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at **http://localhost:8000**

## Seed Data

The database is automatically seeded on first startup with:

- 3 artists (Taylor Swift, Selena Gomez, Ed Sheeran)
- 2 venues with 4 sections × 200 seats each
- 6 concerts
- 12 blog posts, 10 FAQs, 5 gift cards
- Demo user: `sylvievanbeek@gmail.com` / `password123`

To re-seed, delete `bnconcert.db` and restart the server.

## API Documentation

Once running, interactive docs are available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/api/health

## Project Structure

```
backend/
├── app/
│   ├── main.py            # FastAPI app entry point
│   ├── config.py           # Pydantic settings
│   ├── database.py         # SQLAlchemy engine & session
│   ├── dependencies.py     # Auth dependency (get_current_user)
│   ├── seed.py             # Database seeder
│   ├── models/             # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── concert.py
│   │   ├── order.py
│   │   └── content.py
│   ├── schemas/            # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── concert.py
│   │   ├── order.py
│   │   └── content.py
│   ├── routers/            # API route handlers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── concerts.py
│   │   ├── artists.py
│   │   ├── orders.py
│   │   ├── blogs.py
│   │   ├── faq.py
│   │   └── gift_cards.py
│   └── services/           # Business logic
│       ├── auth_service.py
│       └── order_service.py
├── .env
└── pyproject.toml
```
