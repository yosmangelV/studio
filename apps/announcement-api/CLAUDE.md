# Announcement API — Project Rules

See `ARCHITECTURE.md` for full stack documentation. This file adds agent-facing rules.

---

## Project Context

NestJS + MongoDB backend for the baby announcement app. Serves personalized slide-based messages keyed by a unique code. Consumed by `projects/announcement-web`.

---

## Stack

- **NestJS** — Angular-style module system for Node.js
- **Mongoose** — MongoDB ODM (schemas, models, queries)
- **MongoDB** — document store (collection: `messages`)

---

## Folder Structure

```
src/
├── app.module.ts            ← Root module: MongooseModule + MessagesModule
├── main.ts                  ← Bootstrap, port from .env
└── messages/
    ├── messages.module.ts
    ├── messages.controller.ts   ← HTTP endpoints only, delegates to service
    ├── messages.service.ts      ← Business logic, DB queries
    ├── schemas/
    │   └── message.schema.ts    ← Mongoose schema + TypeScript types
    └── dto/
        └── message-response.dto.ts  ← API response contract

scripts/
├── seed.ts                  ← Writes the stories in seed-data.local.json (replaces only those codes)
├── seed-export.ts           ← Read-only: rebuilds seed-data.local.json from the database
├── seed-data.ts             ← Seed file shape, reader and checks, Mongoose model
├── seed-data.example.json   ← Committed: one invented story with every slide type
└── seed-data.local.json     ← Gitignored: the real stories (names, photos). Never commit it
```

The real stories are private: recipients' names and their photos never go into the repo, a commit, a PR or a comment. They live in `seed-data.local.json` on the owner's machine; `npm run seed:export` rebuilds it from the database if it is lost. `npm run seed` writes to the database the `.env` points at, so only the owner runs it.

---

## Endpoint

```
GET /messages/:code
```

- Returns `MessageResponseDto` on success
- `404` if code does not exist
- `410 Gone` if `isActive: false`

---

## Rules

- **Controllers delegate only** — no business logic in controllers
- **Service owns DB** — all Mongoose queries live in `messages.service.ts`
- **DTOs as contract** — never expose raw Mongoose documents; map to DTO before returning
- **No new modules without a spec** — add a file to `specs/` before implementing any new feature
- **Codes are case-insensitive** — always normalize to uppercase before querying

---

## Commands

```bash
npm ci                        # Install dependencies
npm test                      # Run tests
npm run start:dev             # Dev server with hot reload
npm run seed                  # Write seed-data.local.json to the DB in .env (owner only)
npm run seed:export           # Rebuild seed-data.local.json from the DB (read only)
```
