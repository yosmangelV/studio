# Studio Design System — Claude Guidelines

## Project Overview

Angular workspace + library design system. Library: `projects/ui`. Storybook v10 for documentation.

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

## Project Rules

### Angular
- **Always use standalone components** — no NgModules
- **Prefer Signals over RxJS** — use `signal()`, `computed()`, `effect()`, `linkedSignal()`, `resource()`. Use RxJS only when interoperating with existing streams or HTTP
- **Smart/Dumb component split** — smart components handle state/data, dumb components receive `@Input()` / emit `@Output()` only
- **No business logic in templates** — computed values go in the component class, not inline expressions in HTML
- **Use Signal-based inputs/outputs** — `input()`, `output()`, `model()` instead of decorator-based `@Input()` / `@Output()` where possible

### Design System
- **Follow Atomic Design** — atoms → molecules → organisms. File path: `projects/ui/src/lib/{atoms|molecules|organisms}/component-name/`
- **Always use design tokens** — colors, spacing, radii, shadows via CSS custom properties from `tokens.scss`. Never hardcode values
- **Dark mode required** — every component must support `prefers-color-scheme: dark` and the `.dark` class strategy
- **Accessibility AA required** — WCAG 2.2 Level AA minimum. Use native HTML elements, `:focus-visible`, ARIA only when necessary, min 44×44px touch targets
- **SCSS with BEM** — component styles use BEM (`.btn`, `.btn--primary`, `.btn__icon`). Tailwind for layout utilities in templates

### Code Quality
- No `any` types — use proper generics or `unknown`
- Export everything from `public-api.ts`
- Stories required for every component in Storybook
- Run `npm run build:ui` after changes to verify no build errors

## Project Structure

```
studio/
├── .agents/skills/         ← Skills reference library
├── .claude/commands/       ← Custom slash commands
├── .storybook/             ← Storybook config
├── projects/ui/src/
│   ├── lib/
│   │   ├── atoms/          ← Basic building blocks (Button, Input, Badge...)
│   │   ├── molecules/      ← Compound components (FormField, Alert, Card...)
│   │   └── organisms/      ← Complex sections (Header, Table, Modal...)
│   ├── styles/
│   │   ├── global.css      ← Tailwind v4 import + base styles
│   │   └── tokens.scss     ← CSS custom properties (design tokens)
│   └── public-api.ts       ← Public exports
├── postcss.config.js
├── tailwind.config.js
└── angular.json
```

## Commands

```bash
npm run storybook       # Start Storybook dev server → http://localhost:6006
npm run storybook:build # Build static Storybook
npm run build:ui        # Build the library
```
