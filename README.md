# Studio Monorepo

A personal monorepo containing a design system, multiple Angular applications, and their supporting APIs. Built as an open portfolio — all code is public and production-deployed.

[![CI — Design System](https://github.com/yosmangelV/studio/actions/workflows/ci-design-system.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-design-system.yml)
[![CI — Boxing Gym](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym.yml)
[![CI — Announcement Web](https://github.com/yosmangelV/studio/actions/workflows/ci-announcement-web.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-announcement-web.yml)
[![Chromatic](https://img.shields.io/badge/Storybook-Chromatic-FF4785?logo=storybook&logoColor=white)](https://www.chromatic.com/library?appId=6aa5a635a53be81ff5ff530b)

---

## Projects

### Design System
A component library built with Angular, Tailwind v4, and SCSS/BEM following Atomic Design principles. Tokens-first approach with full dark mode and WCAG 2.2 AA accessibility support.

- **Storybook:** [chromatic.com/library?appId=6aa5a635a53be81ff5ff530b](https://www.chromatic.com/library?appId=6aa5a635a53be81ff5ff530b)
- **Path:** `projects/design-system/`

---

### Boxing Gym App
Management platform for a boxing gym. Handles student management, authentication via Supabase, and class scheduling.

- **Frontend:** Angular 21 — [boxing-gym-ten.vercel.app](https://boxing-gym-ten.vercel.app)
- **API:** Python + FastAPI + Supabase — deployed on Render
- **Paths:** `projects/boxing-gym/` · `apps/boxing-gym-api/`

---

### Announcement Web
Personalized baby announcement app with animated reveal and multi-segment experience.

- **Frontend:** Angular 21 — [announcement-web-seven.vercel.app](https://announcement-web-seven.vercel.app)
- **API:** NestJS + MongoDB — deployed on Render
- **Paths:** `projects/announcement-web/` · `apps/announcement-api/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Angular 21 (standalone, signals, OnPush) |
| Monorepo tooling | Nx 22 |
| Styling | Tailwind CSS v4 + SCSS/BEM + CSS custom properties |
| Component docs | Storybook 10 + Chromatic |
| Backend (gym) | Python 3.12 + FastAPI + Supabase |
| Backend (announcement) | Node.js + NestJS 11 + MongoDB |
| Auth | Supabase (JWT + JWKS) |
| Frontend deploy | Vercel |
| API deploy | Render |
| CI | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- Python 3.12+ with [uv](https://docs.astral.sh/uv/) (for boxing-gym-api)

### Install

```bash
git clone https://github.com/yosmangelV/studio.git
cd studio
npm ci
```

---

## Running Apps

### Design System — Storybook

```bash
npm run storybook
# → http://localhost:6006
```

### Boxing Gym (Angular frontend)

```bash
# Copy and fill in env vars first
cp projects/boxing-gym/.env.example projects/boxing-gym/.env

npm run boxing-gym
# → http://localhost:4301
```

### Announcement Web (Angular frontend)

```bash
npm run announcement
# → http://localhost:4200
```

### Boxing Gym API (FastAPI)

```bash
cd apps/boxing-gym-api
cp .env.example .env  # fill in Supabase credentials

uv sync
uv run uvicorn app.main:app --reload
# → http://localhost:8080
```

### Announcement API (NestJS)

```bash
cd apps/announcement-api
cp .env.example .env  # fill in MongoDB URI

npm ci
npm run start:dev
# → http://localhost:3000
```

---

## Environment Variables

### Boxing Gym API (`apps/boxing-gym-api/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_JWKS_URL` | Supabase JWKS endpoint for JWT verification |
| `CORS_ORIGINS` | Allowed frontend origins |

### Announcement API (`apps/announcement-api/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CORS_ORIGIN` | Allowed frontend origin |

### Boxing Gym Frontend (`projects/boxing-gym/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `API_URL` | Boxing Gym API base URL |

---

## Running Tests

```bash
# Design system
npx nx test design-system --watch=false

# Boxing Gym frontend
npx nx test boxing-gym --watch=false

# Announcement Web
npx nx test announcement-web --watch=false

# Announcement API
cd apps/announcement-api && npm test
```

---

## Project Structure

```
studio/
├── apps/
│   ├── announcement-api/     ← NestJS + MongoDB
│   └── boxing-gym-api/       ← FastAPI + Supabase
├── projects/
│   ├── design-system/        ← Angular component library
│   │   └── src/lib/
│   │       ├── atoms/
│   │       ├── molecules/
│   │       └── organisms/
│   ├── boxing-gym/           ← Angular app
│   └── announcement-web/     ← Angular app
├── .github/workflows/        ← CI pipelines
├── .storybook/               ← Storybook config
└── render.yaml               ← Render deployment config
```

---

## CI / CD

| Workflow | Trigger | What it does |
|---|---|---|
| `ci-design-system` | Changes in `projects/design-system/` | Runs unit tests |
| `ci-boxing-gym` | Changes in `projects/boxing-gym/` | Runs unit tests |
| `ci-announcement-web` | Changes in `projects/announcement-web/` | Runs unit tests |
| `ci-announcement-api` | Changes in `apps/announcement-api/` | Runs Jest tests |
| `chromatic` | Changes in `projects/design-system/` or `.storybook/` | Publishes Storybook to Chromatic |

---

## License

MIT — feel free to use, fork, or learn from any of the code here.
