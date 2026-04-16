# BNConcert

A full-stack concert ticket booking mobile app with React Native (Expo) frontend and FastAPI backend.

## Quick Start

### 1. Start Backend

```bash
cd bn_concert/backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs → http://localhost:8000/docs

### 2. Start Frontend

```bash
cd bn_concert/frontend
npm install --legacy-peer-deps
# Edit .env → set EXPO_PUBLIC_API_URL to your LAN IP
npx expo start
```

Scan QR code with **Expo Go** on your phone.

### Demo Login

```
Email:    sylvievanbeek@gmail.com
Password: password123
```

## Documentation

- [Backend README](backend/README.md) — API setup, endpoints, seed data
- [Frontend README](frontend/README.md) — Expo setup, project structure, tech stack
- [Requirements](docs/REQUIREMENTS.md) — User stories, data models, API spec
