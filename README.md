# Studio Monorepo

My personal monorepo: Angular apps with their APIs, the component library they share, and a few prototypes. All the code is public. Start with a project below; each one links to its code and, where there is one, its live version.

[![CI — Design System](https://github.com/yosmangelV/studio/actions/workflows/ci-design-system.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-design-system.yml)
[![CI — Boxing Gym](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym.yml)
[![CI — Boxing Gym API](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym-api.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-boxing-gym-api.yml)
[![CI — Announcement Web](https://github.com/yosmangelV/studio/actions/workflows/ci-announcement-web.yml/badge.svg)](https://github.com/yosmangelV/studio/actions/workflows/ci-announcement-web.yml)
[![Storybook](https://img.shields.io/badge/Storybook-Chromatic-FF4785?logo=storybook&logoColor=white)](https://main--6aa5a635a53be81ff5ff530b.chromatic.com)

---

## Projects

### Boxing Gym
A website and management app for boxing schools: students, payments and classes. It runs today at El Arte del Guante. It is meant as a template: each school deploys its own copy, with its own landing page and domain, rather than sharing one central app.

- **Live:** [boxing-gym-ten.vercel.app](https://boxing-gym-ten.vercel.app)
- **Frontend:** Angular 21, on Vercel · [`projects/boxing-gym/`](projects/boxing-gym)
- **API:** Python, FastAPI and Supabase, on Render · [`apps/boxing-gym-api/`](apps/boxing-gym-api)

---

### Announcement Web
A personalized baby announcement told as an animated story, in three versions for different audiences. It is private by design: only the people who receive a link with their own code can open it, so there is no public demo.

- **Frontend:** Angular 21, on Vercel · [`projects/announcement-web/`](projects/announcement-web)
- **API:** NestJS and MongoDB, on Render · [`apps/announcement-api/`](apps/announcement-api)

---

### Design System
The Angular component library the apps build on: Tailwind v4 and SCSS/BEM, organised with Atomic Design, with design tokens, dark mode and WCAG 2.2 AA. Colour contrast is checked in CI.

- **Storybook:** [main--6aa5a635a53be81ff5ff530b.chromatic.com](https://main--6aa5a635a53be81ff5ff530b.chromatic.com)
- **Path:** [`projects/design-system/`](projects/design-system)

---

### Diversion Prototype
A throwaway Godot 4 prototype that tests one game mechanic: luring a monster away from a city with beacons. Its acceptance criteria run against the real game in CI.

- **Path:** [`projects/diversion-prototype/`](projects/diversion-prototype)

---

### Ideas in specification
`projects/baby-guide/` and `projects/kids-anxiety/` hold only a spec for now.

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
│   ├── announcement-web/     ← Angular app
│   ├── diversion-prototype/  ← Godot 4 prototype
│   ├── baby-guide/           ← spec only
│   └── kids-anxiety/         ← spec only
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
| `ci-boxing-gym-api` | Changes in `apps/boxing-gym-api/` | Runs pytest and checks that migrations never write user data |
| `ci-announcement-api` | Changes in `apps/announcement-api/` | Runs Jest tests |
| `ci-diversion-prototype` | Changes in `projects/diversion-prototype/` | Runs the acceptance criteria in Godot |
| `chromatic` | Changes in `projects/design-system/` | Publishes Storybook to Chromatic |

---

## License

[MIT](LICENSE) — feel free to use, fork, or learn from any of the code here.
