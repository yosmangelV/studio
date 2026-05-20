# Architecture Principles

## Philosophy

This workspace prioritizes:
- Scalability and maintainability over short-term speed
- Predictable ownership with explicit boundaries
- Gradual evolution — no big bang rewrites
- Developer experience that scales with complexity

---

## Core Principles

### 1. Incremental Evolution

Avoid:
- Big bang rewrites or full refactors without a migration plan
- Risky architectural changes without a rollback strategy

Prefer:
- Progressive migration with compatibility layers
- Feature flag rollouts for risky changes
- Adapter-based transitions when shifting data contracts

### 2. Explicit Ownership

Every component, service, and module must have:
- A single clear responsibility
- Predictable input/output boundaries
- No cross-domain state manipulation

Avoid:
- Shared business logic spread across layers
- Components that own state they don't manage
- Services that do too much

### 3. Separation of Concerns

| Layer | Responsibility |
|-------|---------------|
| **Atoms / Molecules / Organisms** | Presentational — receive data, emit events |
| **Smart components** | Orchestrate state and data fetching |
| **Services** | Domain logic, API calls, state |
| **Stores (if used)** | Predictable state container |

---

## Design System Architecture

### Atomic Design Hierarchy

```
atoms/       ← No dependencies on other DS components
molecules/   ← Compose atoms only
organisms/   ← Compose molecules and atoms; may have local state
```

Rules:
- Atoms never import from molecules or organisms
- Molecules never import from organisms
- All exports go through `public-api.ts`

### Token Architecture

CSS custom properties in `tokens.scss` are the single source of truth for:
- Color (semantic + primitive)
- Spacing
- Typography scale
- Border radius
- Shadows
- **Animation** (duration, easing, stagger, slide distances)

Never hardcode design values in component SCSS. Reference tokens only.

---

## Application Architecture (baby-announcement app)

### Structure

```
apps/
  baby-announcement/
    src/
      app/
        core/            ← App-wide services, guards, interceptors
        features/
          slideshow/     ← Slide sequencing, animation logic
          reveal/        ← Final reveal screen
        shared/          ← Shared presentational components using DS
      environments/
```

### Data Flow

```
Backend API (Node.js)
  → unique URL code
  → returns PersonalizedContent JSON
  → Angular resolves on route
  → Smart component distributes to dumb slideshow components
```

### Segment Strategy

Each recipient URL maps to a segment (`vip` | `friends` | `family`) returned by the backend. The frontend never hardcodes segment logic — it renders whatever the API returns. This keeps the frontend segment-agnostic and backend-authoritative.
