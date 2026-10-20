# Announcement Web — Project Rules

Extends the root `CLAUDE.md`. These rules are specific to this application and take precedence over the root when they conflict.

---

## Project Context

Personalized baby announcement app. Angular frontend that fetches a message by code from the Announcement API (NestJS + MongoDB) and renders an animated slideshow reveal. Three audience segments: special, friends, family.

---

## Folder Structure

```
src/app/
├── core/
│   ├── models/            ← TypeScript interfaces matching API response DTOs
│   └── services/          ← HTTP client services (fetch message by code)
├── features/
│   └── story-player/      ← Animated slideshow player (reads message + renders slides)
└── shared/                ← Shared dumb UI components
```

---

## Data Flow

```
Route param (:code)
  → AnnouncementService.getByCode(code)    ← GET /messages/:code
  → signal<Message | null>
  → StoryPlayerComponent                   ← dumb, reads signal via input
```

Rules:
- Services fill signals — components never call `firstValueFrom` or `subscribe()`
- HTTP calls live in `core/services/` — components only call void service methods and read signal state
- Match the API response shape exactly in `core/models/` — no transformation in services

---

## API Contract

```typescript
// core/models/message.model.ts
export interface Slide {
  title: string;
  body: string;
  image?: string;
  footer: string;
}

export interface Message {
  id: string;
  code: string;
  audienceType: 'special' | 'friends' | 'family';
  recipientName: string | null;
  slides: Slide[];
}
```

Error codes from the API:
- `404` — code not found
- `410` — message exists but `isActive: false`

Both must be handled gracefully in the UI.

---

## Testing

- **Runner**: Vitest
- **Library**: `@testing-library/angular` — `render` API
- `vi.fn()` for mocks, never `jest.fn()`
- `data-testid` naming: `announcement-<element>` (e.g., `announcement-slide-title`, `announcement-slide-image`)

---

## Commands

```bash
npx nx serve announcement-web     # Dev server
npx nx test announcement-web --watch=false
```
