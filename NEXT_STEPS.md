# Next steps

Handoff note, updated 2026-11-10. Update it as items close, and delete it when the list is empty.

## How we work

- One PR at a time, opened as a draft.
- Review before pushing (`/code-review`), then work through CodeRabbit until it reports "No actionable comments". Reply in every thread, naming the commit that fixes it.
- The repo owner marks the PR ready and merges.
- The repo is public: never put real student names or emails in commits, PRs, comments, code or docs. Grep the staged diff before committing.
- Production database: read-only for audits. Never submit panel forms during an audit, because the API writes to production.
- Users, students and payments are created on demand outside the repo, never from a migration or script (CI enforces this since #33).
- Git identity is repo-local only. Never change the global git config.

## 1. Waiting on others

- [ ] **GitHub Support ticket** (sent 2026-11-08) to purge the cached views of the history rewritten below. The old commit SHAs are listed in the ticket only, not here, so this public file does not point at them. When Support replies, each of those SHAs should return 404:
  ```bash
  gh api repos/yosmangelV/studio/commits/<old-sha> --jq .sha   # expect "Not Found"
  ```
  Also ask Support to clear the refs of #39: an early commit of this note named the old SHAs (pointers only, not the data).

## 2. History purge (done 2026-11-08), follow-ups

What was done:
1. `git filter-repo` ran on a fresh `--mirror` clone and removed `projects/boxing-gym/scripts/create-user.mjs` and `apps/boxing-gym-api/scripts/seed_reset.py` from every commit.
2. A mailmap moved the work email to the GitHub noreply address, and a message callback dropped one external `Co-authored-by` line.
3. The resulting tree was byte-identical to the previous `main`, minus those two files.
4. The owner opened branch protection briefly (force push on, `enforce_admins` off), pushed with `--force-with-lease` and restored protection. It was then compared field by field with a backup.

New `main` after the rewrite: `e9f3068`.

- [ ] Re-clone every other copy of the repo; do not pull into an old one. A plain `pull` merges the old history back in and could push it again.
- [ ] If the sample password from the deleted `create-user.mjs` was ever used on a real account, rotate it in Supabase.

## 3. Next PRs, in order

1. **Announcement history purge (owner).** #52 took the stories (real names) and the ultrasound details out of the tree, but the old versions of `apps/announcement-api/scripts/seed.ts`, `semana12.jpg` and `ultrasound.jpg` are still in the public history. The steps are in the #52 description: `git filter-repo --strip-blobs-with-ids` with the old blobs (this keeps the current files), then a force push with protection opened briefly, a GitHub Support ticket and deleting the old Vercel deployments. The other photos in `public/assets/stories/` are personal too; moving them out of the repo is not decided.
2. ~~**Remaining boxing-gym items**~~ (`projects/boxing-gym/design.md`), all closed:
   - ~~REFLEX 77: the "Nuestras clases" `striped-list` reaches 69% at 1440px.~~ Done in #50.
   - ~~F19: four font weights in use; the fourth (500) comes from the DS `page-nav`.~~ Done in #46, #50 and #53.
   - ~~The splash gloves are the 🥊 emoji; replace them with a drawn SVG glove.~~ Done in #55.
   - ~~DS input border contrast: `--color-border-strong` is 1.7:1, below 3:1.~~ Done in #46.
   - ~~Pre-existing primitive tokens used directly in components outside the audited panel.~~ Done in #53; `test:contrast` now rejects them (`forbiddenTokens`, #50).
3. **Design-system follow-ups**, deferred from the #50 review:
   - **Tracking and measure tokens.** `letter-spacing` is a literal in 4 DS components (striped-list, typography, page-nav, hero-section; 7 different values), and the `striped-list` columns use `14rem` and `30rem`. `tokens.scss` has no scale for either. Add a small tracking scale (and named measures if they repeat), then move every component to it in one PR, since the values change together.
   - ~~**Sass and size warnings from #50.** `ng build boxing-gym` warns that `_breakpoints.scss` uses the deprecated global `map-get`/`map-has-key` (use `@use 'sass:map'`), and that `hero-section`'s styles are 147 bytes over the 4 kB warning budget (the error is at 8 kB).~~ Done in #56.
   - **Compact page-nav menu below 768px.** Under 768px the nav shows no links, and boxing-gym projects no other menu, so phones reach the sections only by scrolling or through the hero actions. Add a disclosure menu to the organism: a button with `aria-expanded`, Escape to close, focus returned to the button, and closing on link click.
4. ~~**Chromatic snapshot quota.** The workflow snapshots every story (~74) on each push that touches the design system, and on 2026-11-10 the account reached its 5,000-snapshot limit, so "UI Tests" stops reporting until the period resets. Enable TurboSnap (`onlyChanged: true` in `.github/workflows/chromatic.yml`; `fetch-depth: 0` is already set) so a build only snapshots the stories a change affects.~~ TurboSnap enabled in #57; confirm on the first build after the quota resets that it reports "TurboSnap" and snapshots only the affected stories.
5. Optional, from the zizmor auditor persona: workflow `concurrency` (cancel superseded PR runs) and a GitHub environment for the Chromatic secret.
6. Optional: Dependabot for `github-actions`, so the SHAs pinned in #34 get bumped.
7. Optional: CodeRabbit `chill` profile for some paths (offered, not decided).

## 4. Housekeeping

- [ ] When audits are over: delete the Supabase audit account and the `AUDIT_EMAIL` / `AUDIT_PASSWORD` lines from `apps/boxing-gym-api/.env`.

## Reference

- Required checks on `main`: Boxing Gym test, Design System test, Announcement Web test, Announcement API test, Boxing Gym API test (GitHub Actions, `app_id` 15368), CodeRabbit (`app_id` 347564). Each GitHub Actions check is its workflow's `gate` job, which always runs and passes only when the tests passed or the `changes` filter found nothing relevant; the test job itself is `<name> (run)` and is not required (#45). `enforce_admins` on, force push off, PRs required (ruleset "Main PR Restrictions").
- All workflow actions are pinned to commit SHAs, with `persist-credentials: false` and `permissions: contents: read` (#34).
- Agent rules per project: `CLAUDE.md` at the root, `apps/boxing-gym-api/CLAUDE.md`, and each project's `design.md`.
