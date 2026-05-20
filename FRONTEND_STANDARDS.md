# Frontend Standards

## Naming Standards

Names must:
- Reveal intent
- Be domain-oriented and explicit
- Avoid ambiguity

Avoid these generic suffixes/names:
- `helper`, `manager`, `util`, `data`, `info`, `temp`, `misc`

Prefer domain names:
- `slideshow-player`, `recipient-resolver`, `announcement-card` over `card-helper`

---

## Component Standards

Every component must:
- Use `ChangeDetectionStrategy.OnPush`
- Use `inject()` instead of constructor injection
- Be standalone (no NgModules)
- Stay ≤ ~300 lines — extract when growing

Templates must:
- Avoid method calls — use `computed()` or pipes
- Avoid complex inline expressions — move to the class
- Use `@if`, `@for`, `@switch` (Angular 17+ control flow)
- Use semantic HTML elements for accessibility

If a component grows:
- Extract a facade service for state orchestration
- Extract domain services for business logic
- Extract reusable presentational components

---

## Signals Standards

Prefer signal-based APIs throughout:

```typescript
// Inputs
readonly content = input.required<SlideContent>();
readonly active = input(false);

// Outputs
readonly completed = output<void>();

// Internal state
private readonly currentIndex = signal(0);
readonly progress = computed(() => this.currentIndex() / this.total());
```

Use RxJS only when:
- Interoperating with HTTP (`HttpClient` returns Observables)
- Working with existing event streams (WebSockets, router events)
- Using `toSignal()` to bridge into signal world

Avoid:
- Manual `subscribe()` / `unsubscribe()` — use `toSignal()` or `async` pipe
- Nested subscriptions
- Imperative subscription side effects

---

## SCSS / BEM Standards

Component styles use BEM:

```scss
.card { }              // Block
.card--elevated { }    // Modifier
.card__header { }      // Element
.card__header--full { } // Element modifier
```

Rules:
- All values reference design tokens (`var(--token-name)`) — never hardcode
- Dark mode via `@mixin dark-tokens` and `.dark` class (already in `tokens.scss`)
- No `!important`
- No inline styles in templates (except Storybook stories)

---

## TypeScript Standards

- No `any` — use generics or `unknown`
- Explicit return types on public methods and service functions
- Prefer `readonly` for inputs and immutable properties
- Use discriminated unions for variant types:

```typescript
type Segment = 'vip' | 'friends' | 'family';
type CardVariant = 'elevated' | 'outlined' | 'flat';
```

- Avoid type assertions (`as Type`) unless at system boundaries (API responses)
- Use `satisfies` operator over type assertions for config objects

---

## Tailwind Standards

Tailwind v4 utilities are for **layout** in templates:
- Flexbox, grid, spacing between components
- Responsive breakpoints

Not for:
- Component-level design (colors, borders, shadows) — those use BEM + tokens
- One-off overrides that belong in component SCSS

---

## Animation Standards

Use tokens from `tokens.scss` for all animation values:

```scss
transition: opacity var(--duration-cinematic) var(--ease-out);
animation: slide-up var(--duration-xslow) var(--ease-spring) var(--stagger-2) both;
```

Respect `prefers-reduced-motion`:

```scss
@media (prefers-reduced-motion: reduce) {
  // disable or simplify animations
}
```
