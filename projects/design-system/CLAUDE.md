# Design System — Project Rules

Extends the root `CLAUDE.md`. These rules are specific to this library and take precedence over the root when they conflict.

---

## Project Context

Shared component library consumed by all apps in the monorepo. Built with Angular standalone components, SCSS/BEM, Tailwind v4 utilities, and CSS custom property tokens. Published as an Nx library — not a standalone app.

---

## Folder Structure

```
src/
├── lib/
│   ├── atoms/             ← Basic building blocks (single responsibility, no composition)
│   │   ├── badge/
│   │   ├── button/
│   │   ├── image/
│   │   ├── input/
│   │   └── typography/
│   ├── molecules/         ← Compound components (compose atoms)
│   │   ├── card/
│   │   ├── form-field/
│   │   ├── pagination/
│   │   ├── section-header/
│   │   └── striped-list/
│   └── organisms/         ← Complex sections (compose molecules + atoms)
│       ├── hero-section/
│       └── page-nav/
├── styles/
│   ├── global.css         ← Tailwind v4 @import + base resets
│   └── tokens.scss        ← CSS custom properties (design tokens)
├── ui.ts                  ← Re-exports all components for consumers
└── public-api.ts          ← Public surface of the library
```

---

## Component Anatomy

Each component folder follows this structure:

```
component-name/
├── component-name.component.ts        ← Logic, inputs, outputs
├── component-name.component.html      ← Template
├── component-name.component.scss      ← BEM styles
├── component-name.component.spec.ts   ← Unit tests
└── component-name.stories.ts          ← Storybook stories
```

---

## Styling Rules

- **Tokens only** — all color, spacing, radius, shadow, and animation values must come from `tokens.scss` CSS custom properties. No hardcoded values.
- **BEM** — class naming: `.component-name`, `.component-name--modifier`, `.component-name__element`
- **Tailwind for layout** — use Tailwind utilities in templates for layout (flex, grid, gap, padding). BEM for component-specific styles.
- **Dark mode required** — every component must support both `prefers-color-scheme: dark` and the `.dark` class strategy using token variants.
- **No global side effects** — component SCSS must be scoped. Never write global selectors.
- **Text colours are text-role tokens** — `--color-text-*`, `--color-text-accent` for brand-coloured text, `--color-text-on-primary` on primary and `*-solid` fills. Never `--color-primary-*` or a literal as `color`.
- **Never remove focus** — the global `:focus-visible` ring applies; replacing it needs an equally visible style and an `// a11y-ok:` note on the `outline: none` line.
- **Contrast is tested** — `npm run test:contrast` checks every token pair in `contrast.config.json`. A new token or surface adds its pairs there.

---

## Component Rules

- **Standalone only** — every component uses `standalone: true`. No NgModules.
- **OnPush required** — `ChangeDetectionStrategy.OnPush` on every component.
- **Signal inputs/outputs** — use `input()`, `output()`, `model()`. Never `@Input()` / `@Output()`.
- **No business logic** — components are purely presentational. No services injected, no data fetching.
- **WCAG AA** — min 44×44px touch targets, sufficient color contrast, `:focus-visible` rings, ARIA only when native HTML is insufficient.
- **Export everything** — any new component must be exported from both `ui.ts` and `public-api.ts`.

---

## Atomic Design Boundaries

| Level | Composes | Example |
|-------|----------|---------|
| Atom | Nothing — standalone primitive | `ButtonComponent`, `BadgeComponent` |
| Molecule | Atoms only | `FormFieldComponent` (label + input + hint) |
| Organism | Molecules + Atoms | `HeroSectionComponent` |

Strict rule: atoms must not compose other atoms. If composition is needed, it belongs in a molecule.

---

## Testing

- **Runner**: Vitest
- **Library**: `@testing-library/angular` — `render` API
- All components are dumb — test DOM output and emitted outputs only
- Use `screen.getByRole` first, `screen.getByTestId` as fallback
- `data-testid` naming: `ds-<component>[-modifier]` (e.g., `ds-button`, `ds-button-icon`)

```typescript
import { render, screen } from '@testing-library/angular';
import { ButtonComponent } from './button.component';

it('renders the label', async () => {
  await render(ButtonComponent, {
    componentInputs: { label: 'Submit' },
  });
  expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
});
```

---

## Storybook

Every component **must** have a `.stories.ts` file documenting all variants. Stories run at `http://localhost:6006`.

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
};
export default meta;

export const Primary: StoryObj<ButtonComponent> = {
  args: { label: 'Click me', variant: 'primary' },
};
```

---

## Commands

```bash
npm run storybook       # Dev server → http://localhost:6006
npm run storybook:build # Static build
npm run build:ds        # Build the library
npx nx test design-system --watch=false
```
