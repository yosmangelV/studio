# Design: Announcement (announcement-web)

Product rules on top of the root `design.md`. Tokens live in `src/app/shared/styles/announcement-tokens.scss` (colours, faces) over the DS base tokens; the story content comes from the Announcement API, never from the code.

## Who and what for

- **Audience:** family and friends who receive a private link (`/announcement/:code`), almost always on a phone, often opened from a chat app. Three segments (`special`, `friends`, `family`) share one design; only the content changes.
- **The page's one job:** carry the reader from the first slide to the reveal, at their own pace. Everything on screen serves the current slide: no global navigation (no site menu, no header) and no call to action besides the player's own previous and next.
- **Context:** a one-off, emotional moment. It is read once, slowly, sometimes aloud to someone else. Legibility beats decoration.

## Voice

Tender and quiet: a handwritten card, not a party invitation. Warm cream paper, soft lavender and pastel accents, a serif for headings and a script for the one line that carries the feeling. Short sentences, the recipient's real name when the API sends one, and no exclamation-mark filler.

## Colour roles

Ratios are measured on cream (`--ann-bg-cream`), the surface every slide uses today.

| Role | Token | Use | Ratio on cream |
|---|---|---|---|
| Ground | `--ann-bg-cream` | Every slide and the player | — |
| Mood grounds | `--ann-bg-lavender`, `--ann-bg-mist` | Decorative washes only. Not a text surface today; using one under text adds its pairs to `contrast.config.json` first (`--ann-text-soft` on lavender is 4.2:1 and fails) | — |
| Text | `--ann-text-dark` | Headings, body, nav buttons, focus ring | 13.5:1 |
| Supporting text | `--ann-text-soft` | Captions, secondary lines | 7.0:1 |
| Script emphasis | `--ann-text-script` | The one emphasised line per slide, in the script face | **2.8:1 — fails** (needs 3:1 even as large text) |
| Accents | `--ann-accent-gold`, `--ann-accent-sage`, `--ann-accent-pink` | Borders and ornaments only. Never text (2.0, 2.2 and 1.3:1) | — |
| Pastel blue | `--ann-text-accent` | Defined, unused, and 1.95:1: it is not a text colour despite its name | — |

Known failures today, fixed in the migration below:

- The countdown numeral mixes `--ann-text-script` with 40% white (`countdown-slide`): **1.7:1**, and the number is the slide's whole content.
- The ultrasound badge sets literal white on `--ann-text-script`: **3.2:1** at `--text-sm`, and the literal breaks Floor 2.

## Type

- **Display:** Playfair Display (`--ann-font-display`) for slide headings and the reveal title.
- **Script:** Dancing Script (`--ann-font-script`) for one emphasised line per slide, at 24px or more, never for body text or anything functional. *Exception to the root rule of one display and one body family:* the script is the product's voice (the handwritten card); it is kept to emphasis so the page still reads as two faces.
- **Body and everything functional:** Nunito (`--ann-font-body`), sentence case, untracked. Labels and badges included.
- **Weights:** three at most across all faces: 400 and 600 (Nunito, Dancing Script) and 700 (Playfair). Today 400, 600, 700 and 900 are in use and the font link loads six weights.

## Story rules

- **One idea per slide.** A slide's content fits a 390×844 screen without scrolling.
- **The reader sets the pace.** Only the countdown advances by itself (three seconds, and "next" still skips it). No other slide auto-advances: WCAG 2.2.1 gives the reader control over timing.
- **Navigation is always reachable:** previous and next buttons of at least 44px (today 48px) with visible labels for assistive tech, and the arrow keys. On the last slide "next" restarts.
- **Progress** is shown by the dots and exposed as a progressbar (`aria-valuenow` / `aria-valuemax`); the dots themselves are decorative.
- **Motion:** each slide gets one entrance, from `transform` and `opacity`, timed by the DS motion tokens. Under `prefers-reduced-motion` slides appear without animation, and the countdown still counts but its numerals don't animate.
- **Images** always carry the API's `alt`; a slide without an image falls back to its text layout, never a placeholder picture.
- **Errors** (`404` unknown code, `410` deactivated message) get a short, kind sentence in the product's voice, never a status code or a technical message. The API owns that copy today and meets this rule; the player's own fallback is "No pudimos cargar este mensaje."
- **Without a code, the page stays private** (owner's decision, 2026-11-08, replacing the `DEMO-FRIENDS` redirect). `/` and any unknown path show a short "this announcement is private" page that never calls the API, so a visitor without a link sees nothing of what is shared and no error.
- **No eyebrows.** A slide's first line is its heading; the small uppercase label above it goes (root anti-generated rules).
- **Icons are SVG** (root Floor 7): the heart and the nav arrows included.

## Migration from the 2026-11-02 review

The deployed player breaks these rules today. Colour, type and motion fixes go in their own PR after this file.

- [ ] Script emphasis passes 3:1 as large text on cream (darken `--ann-text-script`, or move emphasis to `--ann-text-dark` in the script face)
- [ ] Countdown numeral uses a text role that passes 3:1 (it is display-size), not a mix with white
- [ ] Ultrasound badge: a text-role token on a fill that passes 4.5:1, no literal `#fff`
- [ ] Remove `--ann-text-accent` or rename it to an accent: it is not a text colour
- [ ] Add `contrast.config.json` for announcement-web and wire it into `test:contrast` and CI
- [ ] `prefers-reduced-motion` fallback for every slide animation: no stylesheet in the app has one today (Floor 5)
- [ ] Arrow-key navigation in the story player
- [ ] Heart (❤️) and nav arrows (← → ↺) become SVG icons (Floor 7)
- [ ] Remove the eyebrow from the intro and text slides (`eyebrow` field and `__eyebrow` styles)
- [ ] Three weights: drop Playfair 900 and Dancing Script 700 from the font link and the styles
- [ ] Body text in the body face: `.intro-slide__body` and `.text-slide__body` use `--ann-font-display` today, and should use `--ann-font-body`
- [ ] The reveal title in the display face: `.final-reveal-slide__title` uses `--ann-font-script` today; the script stays for its emphasis line
- [x] Image slide: `[alt]` is bound to `title` instead of the model's `altText`
- [x] Image slide: the caption renders `{{ data() }}`, the whole slide object (`[object Object]`), instead of its text
- [x] Image slide: without an `image` it renders an empty `<img>` instead of falling back to the text layout
- [x] Delete `src/app/app.html`: the unused Angular starter page ("Congratulations! Your app is running. 🎉")
- [ ] Run the Hallmark lint on every demo story against a local API and record the result here (FAIL, REFLEX and WARN counts, and the reason for each REFLEX kept):
  1. `apps/announcement-api`: `npm run seed` (writes DEMO-SPECIAL, DEMO-FRIENDS, DEMO-FAMILY), then `npm run start:dev`
  2. `npm run announcement` (dev server on 4200)
  3. `node .claude/skills/hallmark/scripts/sloplint.mjs --url http://localhost:4200/announcement/<code> --genre editorial --render` for each of the three codes
