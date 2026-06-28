# Project Structure

```text
ai-gym-assistant/
|-- backend/                  Legacy Node.js + MongoDB service
|-- fastapi-backend/          Production FastAPI API
|   |-- app/
|   |   |-- api/
|   |   |-- common/
|   |   |-- core/
|   |   |-- db/
|   |   |-- infrastructure/
|   |   `-- modules/
|   `-- tests/
|-- frontend/                 Next.js frontend
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- public/
|   |-- scripts/
|   `-- src/                  Legacy Vite-era assets kept for reference
|-- ai-models/                ML prototypes and CV utilities
|-- docs/                     Documentation, diagrams, and reports
|-- screenshots/              Placeholder for product screenshots
|-- docker-compose.yml
|-- render.yaml
`-- README.md
```

## Notes

- `fastapi-backend/` is the recommended production API.
- `backend/` is retained for compatibility and validation scenarios.
- `frontend/` is the primary user interface and should be deployed to Vercel.
- `ai-models/` contains offline model experiments and helper scripts.
