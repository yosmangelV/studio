# Design: El Arte del Guante (boxing-gym)

Product rules on top of the root `design.md`. Tokens live in `src/styles/tokens.boxing-gym.scss`; facts live in `src/app/core/config/gym.config.ts`.

## Who and what for

- **Audience:** people near the gym, from complete beginners to competitors, and parents looking at Kids Boxing.
- **The public page's one job:** get a visitor to message the gym on WhatsApp. "See classes" is the route there, not a goal of its own.
- **The app (students, payments):** staff working fast on a phone between classes. It favours density and legibility over atmosphere.

## Voice

An old-school boxing gym: raw, disciplined, close to the ring. Black rooms, crimson, heavy condensed type. It is confident without shouting: short sentences, real facts (classes, hours, coach), and no motivational filler.

## Colour roles

| Role | Token | Use |
|---|---|---|
| Ground | `--gym-surface-app`, `--gym-surface-panel`, `--gym-dark`, `--gym-surface-elevated` | Section and panel backgrounds; alternate app and panel between sections |
| Text | `--gym-text-primary`, `--gym-text-high`, `--gym-text-secondary` | Body, emphasis and supporting text |
| Muted | `--gym-text-muted` | Placeholders, captions, inactive states. Passes 4.5:1 |
| Disabled | `--gym-text-disabled` | Disabled controls only (exempt from contrast) |
| Brand fill | `--gym-brand` (`--color-primary-500`) | Button fills, rules, bars. Never text. White text on it gives 6.0:1 |
| Brand on dark | `--gym-brand-on-dark` (`--color-text-accent`, `--color-border-focus`) | Red text, red figures, links and focus rings |
| Danger | `--gym-text-danger` / `--color-error-solid` | Error text / danger button fill |
| WhatsApp | `--gym-whatsapp` + `--gym-whatsapp-ink` | The WhatsApp button: dark ink on green (9.8:1; white was 1.9:1) |

`--gym-red-500` gives 2.38–3.22:1 as text on the gym surfaces and `--gym-gray` 3.6:1, so both are forbidden as text in `contrast.config.json`. Every pair above is checked by `npm run test:contrast`.

## Type

- **Display:** Oswald (`--font-display`), uppercase, for the hero headline and section headings. This is the gym's voice, and it is the one place uppercase is allowed.
- **Body and everything functional:** Inter (`--gym-font-body`). Nav links, labels, table heads, buttons and the footer are sentence case and untracked.
- **Weights:** Oswald 600 and 700, Inter 400 and 600. The Google Fonts link loads only these.

## Page rules

- **Hero:** the gym's name as the headline, one sentence, and two actions (primary: WhatsApp; secondary: classes).
- **Splash only while there is nothing to show:** on the public landing, on a visit with no cached copy, until the gym data arrives (at least 1.2s so the animation lands, at most 3s, no minimum with reduced motion). Repeat visits, `/login` and the panel never see it (root Floor 8 forbids fixed-duration splashes).
- **Sections span the container:** every section below the hero uses the 1300px container; schedule groups become columns on desktop and contact puts the action beside the details.
- **The install-app banner** is shown only to signed-in users, inside the app shell, never on the public page.
- **Stats** are computed, never typed: active students (counted and rounded down to tens in the database, shown only above the threshold set in `/settings`), years since the founding date, and the number of active classes. A figure with no source is hidden.

## Migration from the 2026-10-28 audit

The live page breaks these rules today. Each item names where it gets fixed.

- [x] Real phone, WhatsApp and address, now in Supabase and editable from `/settings` (Floor 3)
- [x] Stats computed from real data (active students, years since founding, active classes), never typed in (Floor 4)
- [x] Add `--gym-brand-on-dark`; red text uses it (stats, nav subtitle, links, focus rings)
- [x] Labels and footer move from `--gym-gray` to `--gym-text-secondary`
- [x] WhatsApp button: dark text, SVG icon instead of 💬
- [x] DS eyebrow atom removed; `section-header` and `hero-section` lose `eyebrow` and `titleAccent`
- [x] Global `:focus-visible` ring; inputs keep a visible focus border
- [x] Payments styles use defined tokens (`--color-text`, `--color-text-muted`, `--color-primary` did not exist)
- [x] Nav brand subtitle (9.3px) and locale switcher (10.9px) to 12px or more
- [x] Inter labels, nav, buttons and table heads: sentence case, untracked (uppercase stays on Oswald only)
- [x] Replace the 2.8s splash with one tied to the data (`src/app/app.ts`)
- [x] Move the PWA install banner into the authenticated shell
- [x] Widen Classes, Schedule and Contact to the full container
- [x] Re-run the Hallmark lint on `localhost` and record the result here. 2026-11-02, `sloplint --genre editorial --render`: **0 FAIL, 3 REFLEX, 1 WARN** (was 13 FAIL / 5 REFLEX on 2026-10-28). The REFLEX left:
  - 49b ×2: the address link wraps at 320 and 375px. Kept: an address has to wrap on a phone, and `nowrap` would overflow.
  - 77: "Nuestras clases" body reaches 69% at 1440px. The container is full width, but the `striped-list` rows hold short text. Open: see below.
  - WARN F19: four weights in running use; the fourth (500) is the DS `page-nav` links. Open: see below.
- [x] Classes: give the `striped-list` rows mass at 1440px (REFLEX 77), a design-system change. On wide lists the class name is set at `--text-3xl` and the description takes a column on the right edge; the layout follows the list's width (container queries). Rows lost the hover state and arrow, since they are not links. `sloplint --render` no longer reports 77.
- [ ] Weights: DS `page-nav` links use 500 (F19), the panel uses 500 in places, and the Google Fonts link loads Inter 500/700 and Oswald 500, none of which the type rules above allow

## Panel audit, 2026-11-02

The signed-in panel (login, students, student form, payments, analytics, settings, mobile drawer) was read-only audited at 390 and 1440px with axe-core (WCAG 2.2 AA), touch-target, text-size and keyboard-focus checks, using a test admin account. No form was submitted.

Clean from the start: no horizontal scroll, no text under 12px, a visible focus ring on every control, no `any`, no component over 300 lines.

- [x] Mobile topbar scrolled away with the page (`.shell__body` was a scroll container) — #29
- [x] Install banner covered the last action of forms and the sidebar sign-out — #29
- [x] Payment cards were 560px tall when empty; month label read "Noviembre De 2026"; plurals in templates — #29
- [x] Controls between 18 and 41px tall; every control now reaches `--size-touch-target` (44px) — #30
- [x] "Pedidos" and "Clases" ("Pronto") removed from the sidebar: 1.6:1 contrast and screens that don't exist (Floor 3)
- [x] Every panel page is full width, aligned with the students page
- [x] Emoji and glyph icons (✓ ⏳ ⚠ 🚨 ✕ + ← and the 🇪🇸/🇬🇧 flags) are Lucide SVGs; the locale switcher shows a language icon and the code or name (Floor 7)
- [x] The student level select and the payment selects show their prompt instead of rendering empty
- [x] No literal colours left in panel stylesheets; three undefined tokens (`--gym-surface-alt`, `--gym-primary`, `--gym-error`) that only worked through their fallbacks are gone
- [x] Payment rows let the actions wrap, so a student's name is no longer cut short on a phone
- [ ] The splash gloves are the 🥊 emoji: an illustration, not an icon, but still emoji (Floor 7). Needs a drawn SVG glove
