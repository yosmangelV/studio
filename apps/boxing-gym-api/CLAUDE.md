# Boxing Gym API — Project Rules

See `README.md` for full setup documentation. This file adds agent-facing rules.

---

## Project Context

FastAPI + Supabase backend for a boxing school admin panel. Consumed by `projects/boxing-gym` (Angular frontend) via a generated TypeScript client (`@hey-api/openapi-ts`). Deployed on Railway.

**Fase 1 — Active:** Student registration module.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| Validation | Pydantic v2 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Package manager | uv |
| Deploy | Railway |

---

## Folder Structure

```
app/
├── main.py          ← FastAPI app, mounts all routers
├── config.py        ← Pydantic Settings (reads from .env)
├── database.py      ← Supabase client singleton
└── students/        ← Students module
    ├── router.py    ← HTTP endpoints (no business logic)
    ├── schemas.py   ← Pydantic request/response models
    └── service.py   ← Business logic and Supabase queries

specs/               ← SDD specs per module (must exist before implementation)
migrations/          ← SQL migrations
```

---

## Development Workflow (SDD)

Before writing code for any new feature:

1. **Create or update** `specs/<module>.md` — define the user story, data model, endpoints, business rules, and out-of-scope items
2. **Review the spec** before implementation
3. **Implement** following the spec as source of truth
4. **Update the spec** if anything changes during implementation

---

## Rules

- **Routers delegate only** — HTTP layer receives/validates input, calls service, returns response. No business logic in routers.
- **Services own Supabase** — all database calls live in `service.py`
- **Pydantic schemas as contract** — define explicit request and response models; never return raw Supabase dicts
- **RLS enforced** — rely on Supabase Row Level Security; never bypass it with service role key in application code
- **OpenAPI spec is the client contract** — the Angular frontend generates its TypeScript client from `/openapi.json`. Any breaking change to the API requires regenerating the client: `npm run generate:api` in the frontend project.
- **No new endpoints without a spec** in `specs/`

---

## Auth Pattern

Supabase JWT from the Angular frontend is forwarded via `Authorization: Bearer <token>` header. The FastAPI interceptor validates the JWT and extracts the user. Never implement custom auth logic.

---

## Commands

```bash
uv sync                                      # Install dependencies
uv run uvicorn app.main:app --reload         # Dev server → http://localhost:8000
# Docs: http://localhost:8000/docs
# OpenAPI JSON: http://localhost:8000/openapi.json
```
