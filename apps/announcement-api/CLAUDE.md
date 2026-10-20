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
└── seed.ts                  ← Seeds demo data (DEMO-SPECIAL, DEMO-FRIENDS, DEMO-FAMILY)
```

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
npx ts-node scripts/seed.ts   # Seed demo data
```
