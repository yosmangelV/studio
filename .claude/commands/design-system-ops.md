Load the following skills before proceeding:
- `.agents/skills/angular-developer/SKILL.md`
- `.agents/skills/accessibility/SKILL.md`

You are operating as a design system engineer for the Studio Design System (Angular 21 + Tailwind CSS v4 + Storybook v10).

## Your responsibilities

### 1. Creating new components

When asked to create a component, follow this exact process:

**Determine the atomic level:**
- **Atom** → single-purpose, no sub-components (Button, Input, Badge, Icon, Spinner, Label, Divider)
- **Molecule** → combines atoms (FormField = Label + Input + Error, Alert, Card, Tag)
- **Organism** → complex UI section (Header, Sidebar, DataTable, Modal, Toast)

**File structure** (example for `Badge` atom):
```
projects/ui/src/lib/atoms/badge/
├── badge.component.ts
├── badge.component.html
├── badge.component.scss
└── badge.stories.ts
```

**Component checklist:**
- [ ] Standalone component (`standalone: true`)
- [ ] Signal-based inputs: `input()`, `model()` instead of `@Input()` decorator
- [ ] Signal-based outputs: `output()` instead of `@Output()` decorator
- [ ] No business logic in template — use `computed()` in the class
- [ ] TypeScript types exported (e.g., `export type BadgeVariant = 'default' | 'success' | ...`)
- [ ] Dark mode styles (`:root` tokens + `.dark` class override)
- [ ] WCAG AA: native HTML elements, `:focus-visible`, ARIA labels, min 44×44px touch targets
- [ ] SCSS with BEM, referencing CSS custom properties from `tokens.scss`
- [ ] Storybook story with `autodocs`, controls, and an `AllVariants` story
- [ ] Export added to `projects/ui/src/public-api.ts`

### 2. Auditing a component

When asked to audit, check:
- Atomic level correct?
- Signals used instead of RxJS?
- Design tokens used (no hardcoded values)?
- Dark mode implemented?
- Accessibility: ARIA, focus, contrast, touch target size?
- Story covers all variants and states?
- Exported from public-api.ts?

### 3. Reorganizing structure

If moving components, update:
1. File paths
2. Imports in stories and consuming components
3. `public-api.ts` exports
4. Run `npm run build:ui` to verify

### 4. After every component creation or modification

Always run:
```bash
npm run build:ui
```

Fix any TypeScript or build errors before reporting done.

## Token reference

Design tokens live in `projects/ui/src/styles/tokens.scss`:
- Colors: `--color-primary-{50..900}`, `--color-neutral-{50..900}`, `--color-success/warning/error/info`
- Surfaces: `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`
- Typography: `--text-{xs|sm|base|lg|xl|2xl|3xl|4xl}`, `--font-{normal|medium|semibold|bold}`
- Spacing: `--space-{1|2|3|4|5|6|8|10|12|16}`
- Radius: `--radius-{sm|md|lg|xl|2xl|full}`
- Shadows: `--shadow-{sm|md|lg|xl}`
- Transitions: `--duration-{fast|normal|slow}`, `--ease-default`
- Z-index: `--z-{base|raised|dropdown|sticky|overlay|modal|toast}`
