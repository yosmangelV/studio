# Studio Design System — Claude Guidelines

## Developer Profile

You are assisting a **Senior Frontend Engineer** specialized in:
- Angular, Nx Monorepos, RxJS, NgRx
- Enterprise architectures and performance optimization
- Frontend scalability and API migration strategies
- Feature flag systems and Developer Experience

The developer values:
- Maintainability over quick hacks
- Scalability over short-term solutions
- Readability over cleverness
- Explicit architecture over implicit magic
- Reactive patterns over imperative code
- Reusability without overengineering
- Incremental migrations over big bang rewrites

---

## General Behavior

When proposing solutions:
- Explain tradeoffs, scalability, performance, and maintainability implications
- Mention migration impact and risks when relevant
- Do not blindly agree with implementation requests — challenge weak architecture respectfully
- If requirements conflict with maintainability, explain why and propose alternatives

See `ARCHITECTURE_PRINCIPLES.md` and `FRONTEND_STANDARDS.md` for full engineering expectations.

---

## Skills Available

Load these skills from `.agents/skills/` when relevant:

| Skill | When to use |
|-------|-------------|
| `angular-developer` | Any Angular component, service, DI, routing, forms, signals |
| `frontend-design` | Visual design decisions, aesthetics, layout composition |
| `accessibility` | WCAG audits, ARIA, keyboard navigation, screen readers |
| `tailwind-css-patterns` | Tailwind utilities, responsive layout, dark mode |
| `typescript-advanced-types` | Complex types, generics, type inference |
| `vitest` | Unit tests for components and services |
| `studio-code-reviewer` | Pre-commit, pre-push, or PR review across Angular/TS, Python/FastAPI, SCSS |

---

## Angular Rules

- **Always use standalone components** — no NgModules
- **`inject()` API** — prefer over constructor injection
- **`ChangeDetectionStrategy.OnPush`** — required on every component
- **Signals over RxJS** — `signal()`, `computed()`, `effect()`, `linkedSignal()`, `resource()`. RxJS only when interoperating with existing streams or HTTP
- **Signal-based inputs/outputs** — `input()`, `output()`, `model()` over decorator-based `@Input()` / `@Output()`
- **Smart/Dumb split** — smart components handle state/data, dumb components are purely presentational
- **No business logic in templates** — computed values in the class, not inline template expressions
- **No method calls in templates** — use `computed()` or pipes instead
- **Components ≤ ~300 lines** — if complexity grows, extract facades, domain services, or reusable UI

---

## Design System Rules

- **Follow Atomic Design** — atoms → molecules → organisms. Path: `projects/design-system/src/lib/{atoms|molecules|organisms}/component-name/`
- **Always use design tokens** — colors, spacing, radii, shadows, animation durations via CSS custom properties from `tokens.scss`. Never hardcode values
- **Dark mode required** — every component must support `prefers-color-scheme: dark` and the `.dark` class strategy
- **Accessibility AA required** — WCAG 2.2 Level AA minimum. Use native HTML elements, `:focus-visible`, ARIA only when necessary, min 44×44px touch targets
- **SCSS with BEM** — component styles use BEM (`.btn`, `.btn--primary`, `.btn__icon`). Tailwind for layout utilities in templates
- **Stories required** — every component needs a Storybook story with all variants documented
- **Export everything** from `public-api.ts`

---

## Code Quality

Never generate:
- `any` types — use proper generics or `unknown`
- Massive components or services (> ~300 lines)
- Nested subscriptions or imperative subscription management
- Magic strings or hardcoded business rules
- Duplicated logic
- God reducers or giant effects
- Unnecessary abstractions

Always prefer:
- Composability and separation of concerns
- Typed contracts
- Predictable data flow
- Explicit ownership

---

## Project Structure

```
studio/
├── .agents/skills/                  ← Skills reference library
├── .claude/commands/                ← Custom slash commands
├── .storybook/                      ← Storybook config
├── projects/design-system/src/
│   ├── lib/
│   │   ├── atoms/                   ← Basic building blocks (Button, Typography, Image...)
│   │   ├── molecules/               ← Compound components (Card, FormField, Alert...)
│   │   └── organisms/               ← Complex sections (Header, Table, Modal...)
│   ├── styles/
│   │   ├── global.css               ← Tailwind v4 import + base styles
│   │   └── tokens.scss              ← CSS custom properties (design tokens)
│   └── public-api.ts                ← Public exports
├── ARCHITECTURE_PRINCIPLES.md
├── FRONTEND_STANDARDS.md
├── PR_REVIEW_GUIDELINES.md
├── postcss.config.js
├── tailwind.config.js
└── angular.json
```

---

## Commands

```bash
npm run storybook       # Start Storybook dev server → http://localhost:6006
npm run storybook:build # Build static Storybook
npm run build:ds        # Build the library
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/code-review` | Review staged changes (pre-commit) |
| `/code-review --branch` | Review all commits on this branch vs `main` (pre-push) |
| `/code-review <PR_NUMBER>` | Review a GitHub pull request |
| `/design-system-ops` | Design system component operations |
| `/frontend-design` | Frontend design and aesthetics decisions |
