# Diversion prototype

Source of truth: `docs/prototype-spec.md` (what and why) and `docs/technical-spec.md` (how). Both are in Spanish, the product's language.

- Godot 4, GDScript, no plugins. Throwaway prototype. The root's Angular and design system rules do not apply here; the code-quality rules do.
- Follow section 8 of the technical spec without exceptions: no art, sound, menus, camera, monster health, physics engine for projectiles, final balance or randomness.
- If a decision affects the feel and neither the spec nor this file settles it, stop and ask.
- Every number lives in `scripts/config.gd`.

## Conventions

- **Language**: code, identifiers, comments, file and node names, commits and log data are in English. Only player-facing text (button labels, the result message) is in Spanish, because the playtesters are Spanish speakers.
- **Style**: the official GDScript style guide. `snake_case` for files, functions and variables, `PascalCase` for classes and nodes, `CONSTANT_CASE` for constants, and static typing everywhere.
- **Structure**: one script per scene. `Main` orchestrates and the other nodes talk to it through signals. `Monster` is an explicit state machine.
- **Tests**: `tests/acceptance.gd` checks the section 7 criteria against the real game. A new behaviour gets a check, and `EXPECTED_CHECKS` is updated with it.

## Decisions made by the author (they extend the spec)

- **Layout (replaces section 4)**: from left to right, containment, monster spawn, city and launcher. All numbers are in `config.gd`.
- **Goal**: the monster walks on the ground towards the nearest intact building, towards the player. Winning means dragging it back with beacons until it reaches containment.
- **Spawn**: the monster appears to the right of containment, not through it, so it does not win on entry.
- **Sliders**: angle 0–180° and power 0–100, step 1.
- **Restart**: R always; a touch only once the game is over.
- **Beacon lifetime (replaces section 5.4)**: a beacon switches off when `beacon_lifetime` runs out, unless the monster reaches it first.
- **Attraction by distance**: 100% of the monster's speed at the centre and `min_attraction` at the edge of the radius, linear in between.
- **Launcher**: it sits on the roof of the last building. Losing that building means losing the weapon, so having no buildings left is always a loss.
- **Foam**: the monster turns the foam colour while it is slowed.

## Commands

From the monorepo root, with `godot` on the PATH or `GODOT_BIN` set:

```bash
npm run diversion:editor   # Opens the project in the editor
npm run diversion:play     # Runs the game
npm run diversion:test     # Checks the section 7 criteria headless
```
