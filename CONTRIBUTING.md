# Contributing to AI Gym & Fitness Assistant

Thanks for helping improve the project.

## Workflow

1. Create a feature branch from `main`.
2. Make focused changes with clear commit messages.
3. Run the relevant tests and builds before opening a pull request.
4. Keep secrets out of the repository and use environment files instead.

## Code Quality

- Follow the existing folder structure and module boundaries.
- Keep API contracts stable unless a change is documented.
- Prefer small, reviewable pull requests.
- Add or update tests when behavior changes.

## Frontend

- Use TypeScript for new frontend code.
- Keep components accessible and responsive.
- Reuse existing shared UI primitives where possible.

## Backend

- Keep FastAPI endpoints async when the data source supports it.
- Preserve dependency injection patterns for services and repositories.
- Update schemas and docs when API payloads change.

## Pull Request Checklist

- [ ] Code is formatted and linted
- [ ] Tests pass locally
- [ ] Environment variables are documented
- [ ] README or docs are updated if needed
- [ ] No secrets, credentials, or generated artifacts are committed
