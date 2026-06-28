# AI Gym Fitness Assistant FastAPI Backend

Production-oriented FastAPI backend scaffold using Clean Architecture, async MongoDB, JWT authentication, dependency injection, Pydantic models, and Swagger/OpenAPI documentation.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Swagger UI:

```txt
http://localhost:8000/docs
```

OpenAPI JSON:

```txt
http://localhost:8000/openapi.json
```

## Modules

- Authentication
- Workout APIs
- Diet APIs
- Chatbot APIs
- Habit Tracker APIs
- Gym Recommendation APIs
- Analytics APIs
- Admin APIs

## Architecture

Each feature module follows:

```txt
router.py       HTTP endpoints
schemas.py      Pydantic request/response models
repository.py   MongoDB persistence
service.py      Business logic
```

Shared application concerns live in:

```txt
app/core        Config, security, logging, exceptions
app/db          MongoDB connection and indexes
app/api         API router and dependencies
app/common      Shared models and utilities
```

## Render deployment

This backend is ready for Render as a Python web service.

### Environment variables

Set these in the Render dashboard or via `render.yaml`:

- `APP_NAME`
- `ENVIRONMENT=production`
- `DEBUG=false`
- `API_V1_PREFIX=/api/v1`
- `SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `MONGODB_URI` with your MongoDB Atlas connection string
- `MONGODB_DB_NAME`
- `BACKEND_CORS_ORIGINS` as a comma-separated list or JSON array
- `LLM_API_KEY`
- `LLM_MODEL`
- `LLM_API_BASE`
- `LLM_TEMPERATURE`
- `NEARBY_GYM_PROVIDER`
- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`
- `STORAGE_REGION`

### Startup command

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Build command

```bash
pip install -r requirements.txt
```

### Health check

Use `/health` for Render health checks.

### MongoDB Atlas

Render should point `MONGODB_URI` at Atlas. In production, startup fails fast if Atlas is unreachable so the deployment does not silently fall back to local memory.

### Local orchestration

- Container: `docker build -t ai-gym-backend .`
- Local orchestration: `docker compose up --build`
- Render: use the root `render.yaml`
