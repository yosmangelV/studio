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
- **No splash screen.** The logo is in the nav and the hero.
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
- [ ] Remove the 2.8s splash (`src/app/app.ts`)
- [ ] Move the PWA install banner into the authenticated shell
- [ ] Widen Classes, Schedule and Contact to the full container
- [ ] Re-run the Hallmark lint on `localhost` and record the result here
