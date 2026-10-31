# Design: Studio

The visual rules for every product in this monorepo. Read this before designing or changing any UI, then read the product's own `projects/<app>/design.md`. Change this file on purpose: the file is the rule, and a PR that breaks a rule either fixes it or amends this file with the reason.

## How the system is layered

| Layer | File | Owns |
|---|---|---|
| Base tokens | `projects/design-system/src/styles/tokens.scss` | Values: neutral scale, spacing, radii, type scale, motion |
| Brand tokens | `projects/<app>/src/styles/tokens.<app>.scss` | The product's palette and faces, remapped onto the DS tokens |
| System rules | `design.md` (this file) | What every product must and must not do |
| Product rules | `projects/<app>/design.md` | Personality, audience, the page's one job, colour roles |

Values live only in token files. This file and the product files name tokens and roles; they never copy a hex value, so they cannot drift. The DS defaults (blue primary, Inter, slate) are a neutral base, never a brand: a product that ships them unmapped has not been designed yet.

Precedence: the Floor below > the product's `design.md` > this file's other sections > any skill's defaults (Hallmark, frontend-design).

## The Floor

Never shipped, in any product, with no waiver.

1. **Contrast is measured on the real surface.** Text 4.5:1 (every text role except disabled, including placeholders and captions), focus rings and UI parts 3:1 against the surface they are drawn over. A brand colour that passes on one surface can fail on the next: every surface the token is used on is checked.
2. **Every text colour comes from a text-role token** (`--color-text-*`, `--color-success`/`--color-error`, or the product's `--<app>-text-*`). No literal colours in component styles, and fill colours (`--color-primary-500`, a brand red) are never used as text.
3. **No placeholder content in production.** No `XXX`, `Calle X`, lorem ipsum or `TODO` values reach a deployed page. Missing data is hidden, not faked.
4. **No invented facts.** Every metric, testimonial, logo and count is real and owned by the product's config. If nobody can source it, it is removed.
5. **Accessibility AA** as in `CLAUDE.md`: native elements, 44x44px touch targets, a `prefers-reduced-motion` fallback for every animation, content visible without JavaScript-driven reveals.
6. **Focus is never removed.** The global `:focus-visible` ring (`--color-border-focus`) applies to every interactive element. A component may replace it with an equally visible style and mark the `outline: none` line `// a11y-ok: <reason>`; it may never just remove it.
7. **Icons are SVG** (`lucide-angular` or the product's own set), never emoji.
8. **Nothing stands between the visitor and the content:** no fixed-duration splash screens, no install or newsletter prompt on a first visit.

### What enforces it

`npm run test:contrast` runs in CI for the design system and every product with a `contrast.config.json`. It fails the build when:

- a text-role token misses 4.5:1, or the focus token misses 3:1, on any surface of any theme (light, dark, and each product layered over both);
- a stylesheet references a `var(--token)` that no token file defines;
- a component sets a literal text colour or uses a forbidden token (a fill colour) as text;
- a component removes the focus outline without an `a11y-ok` note.

A new surface, text role or product adds its pairs to the matching `contrast.config.json`. Rules 3, 4, 5, 7 and 8 are checked by review and by the Hallmark lint below.

## Anti-generated rules

The defaults that make a page read as machine-made. Each one may be overruled by a product's `design.md` only with a written reason.

- **No eyebrows.** No small label above a heading. If a heading needs a label to make sense, the label is the heading.
- **Headings are one colour.** No accent-coloured word, and never half a word. Emphasis comes from size, weight and placement.
- **Labels are body text,** a step smaller, sentence case, untracked. Uppercase with letter-spacing is reserved for the display face at display sizes, if the product's voice calls for it.
- **Minimum sizes:** body 16px, functional text (labels, captions, nav) 12px.
- **Type:** one display family and one body family per product, three weights at most.
- **No** purple-to-blue gradients, cards inside cards, glows as decoration, or decorative status dots.
- **The hero** carries a headline, one sentence and its actions, and all three fit in a 1280x800 screen.
- **Sections have mass.** A section fills the container (roughly ten of twelve columns) with a real object: a list, a table, a picture, a map. A narrow centred box in a wide screen is the tell.
- **Space above a heading is at least twice the space below it**, so the heading belongs to what follows.

## Motion

Use `transform` and `opacity` only, never `transition: all`. One entrance reveal per page at most, visible by default, and no reveal at all under reduced motion. Durations and easings come from the base tokens.

## Verifying a page

Before a public page ships, lint the running app with Hallmark:

```bash
node .claude/skills/hallmark/scripts/sloplint.mjs --url http://localhost:<port>/<route> --genre <genre> --render
```

It needs `puppeteer-core` and Chrome (see the Hallmark README). Fix every FAIL; fix every REFLEX or record why it stays in the PR. The linter checks contrast and layout on the rendered page, which catches what token checks cannot (text over images and gradients); the eyebrow, heading and label rules above are checked by review.

## Products

| Product | Rules | Status |
|---|---|---|
| boxing-gym | `projects/boxing-gym/design.md` | Defined |
| announcement-web | `projects/announcement-web/design.md` | Pending |
| baby-guide, kids-anxiety | — | Pending (spec only) |
