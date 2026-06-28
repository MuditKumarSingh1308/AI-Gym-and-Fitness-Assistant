# AI Gym & Fitness Assistant

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/frontend-Next.js-000000.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)

AI Gym & Fitness Assistant is a portfolio-ready fitness platform that combines workout coaching, diet planning, habit intelligence, gym discovery, analytics, and a conversational AI buddy in one product.

## Short Description

The project pairs a modern Next.js frontend with a FastAPI backend, MongoDB Atlas persistence, JWT authentication, and production deployment support for Vercel, Render, Docker, and cloud storage.

## Features

- AI Workout Trainer with pose tracking, rep counting, and form feedback
- AI Dietician with BMI, calories, macros, and meal planning
- Habit Tracker with streaks, skip prediction, and progress signals
- Gym Recommendation workflows for nearby gyms and challenge ideas
- AI Gym Buddy chatbot with memory, prompt templates, and sentiment support
- Analytics and admin dashboards with Plotly charts
- Production deployment assets, environment templates, and tests

## Tech Stack

- Frontend: Next.js, TypeScript, TailwindCSS, Plotly
- Backend: FastAPI, Pydantic, JWT, async MongoDB
- ML / CV: MediaPipe, OpenCV, scikit-learn, XGBoost, TensorFlow/PyTorch-compatible pipelines
- Chatbot: LLM API integration
- Storage: Firebase Storage or S3-compatible storage
- Deployment: Vercel, Render, MongoDB Atlas, Docker, Docker Compose

## Architecture

- `frontend/` is the customer-facing Next.js application.
- `fastapi-backend/` is the primary production API with modular async routes.
- `backend/` is a legacy Node/Mongoose service retained for compatibility and MongoDB Atlas validation.
- `ai-models/` contains model prototypes and ML utilities.
- `docs/` contains the diagrams, API docs, testing report, and deployment guidance.

## Folder Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full project map.

## Setup Instructions

1. Copy the environment templates.

```bash
copy fastapi-backend\.env.example fastapi-backend\.env
copy frontend\.env.example frontend\.env.local
copy backend\.env.example backend\.env
```

2. Install backend dependencies.

```bash
cd fastapi-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Install frontend dependencies.

```bash
cd frontend
npm install
```

4. Start the services.

```bash
cd fastapi-backend
uvicorn app.main:app --reload

cd frontend
npm run dev

# Production preview
cd frontend
npm run build
npm start
```

5. Optional legacy backend.

```bash
cd backend
npm start
```

## Environment Variables

Backend templates:

- [fastapi-backend/.env.example](fastapi-backend/.env.example)
- [frontend/.env.example](frontend/.env.example)
- [backend/.env.example](backend/.env.example)

Common variables:

- `MONGODB_URI`
- `DATABASE_NAME` or `MONGODB_DB_NAME`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `BACKEND_CORS_ORIGINS`
- `LLM_API_KEY`
- `LLM_MODEL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`

## API Endpoints

Primary backend base path: `/api/v1`

- Authentication: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`
- Workout APIs: `/workouts/*`
- Diet APIs: `/diet/*`
- Chatbot APIs: `/chatbot/*`
- Habit Tracker APIs: `/habits/*`
- Gym Recommendation APIs: `/gym-recommendations/*`
- Analytics APIs: `/analytics/*`
- Admin APIs: `/admin/*`

Swagger UI is available at `http://localhost:8000/docs` when the FastAPI backend is running.

## Deployment Guide

- Frontend: deploy `frontend/` to Vercel.
- Backend: deploy `fastapi-backend/` to Render.
- Database: use MongoDB Atlas in production.
- Storage: use Firebase Storage or an S3-compatible bucket.
- CI/CD: run GitHub Actions for lint, tests, and build verification.
- The frontend build and start scripts automatically stage a temp workspace on Windows OneDrive paths so local builds stay reliable.

## Screenshots

Screenshots are not included in this repository yet. Placeholder instructions live in [screenshots/README.md](screenshots/README.md).

## Future Improvements

- Add live webcam capture and streamed pose visualization in the browser.
- Add richer personalization for diet and workout planning.
- Expand notification delivery through email, push, and WhatsApp-ready providers.
- Add production observability, error tracking, and usage analytics.
- Add more end-to-end tests for the frontend and API workflows.
- Add a captured screenshots set before the first public release.

## Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Installation Guide](docs/INSTALLATION_GUIDE.md)
- [User Manual](docs/USER_MANUAL.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Testing Report](docs/TESTING_REPORT.md)
- [Folder Documentation](docs/FOLDER_DOCUMENTATION.md)
- [Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)
- [ER Diagram](docs/ER_DIAGRAM.md)
- [Sequence Diagram](docs/SEQUENCE_DIAGRAM.md)
- [Deployment Diagram](docs/DEPLOYMENT_DIAGRAM.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Production Checklist](docs/production-checklist.md)
