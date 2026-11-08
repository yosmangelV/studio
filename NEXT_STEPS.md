# Next steps

Handoff note, updated 2026-11-08. Update it as items close, and delete it when the list is empty.

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

1. **Make `Boxing Gym API test` a required check on `main`**, but first fix the `changes` gate in every CI workflow. Each test job `needs: changes` and runs only when the path filter matched. If `changes` itself fails, the test is skipped, and GitHub accepts a skipped required check as passing, so a PR could merge without its tests running. Add a final job per workflow with `if: always()` that fails when `changes` failed or the test failed, and passes only when the test succeeded or the filter succeeded with no relevant changes. Then make those final jobs the required checks (renaming required checks needs a protection update in the same step). This is a repo settings change, so the owner confirms it first. Keep CodeRabbit's `app_id` 347564. The API job has already passed on `main`.
2. **Announcement-web colour, type and motion fixes.** The checklist is in `projects/announcement-web/design.md`, under "Migration from the 2026-11-02 review".
3. **Remaining boxing-gym items** (`projects/boxing-gym/design.md`):
   - REFLEX 77: the "Nuestras clases" `striped-list` reaches 69% at 1440px.
   - F19: four font weights in use; the fourth (500) comes from the DS `page-nav`.
   - The splash gloves are the 🥊 emoji; replace them with a drawn SVG glove.
   - DS input border contrast: `--color-border-strong` is 1.7:1, below 3:1.
   - Pre-existing primitive tokens used directly in components outside the audited panel.
4. Optional, from the zizmor auditor persona: workflow `concurrency` (cancel superseded PR runs) and a GitHub environment for the Chromatic secret.
5. Optional: Dependabot for `github-actions`, so the SHAs pinned in #34 get bumped.
6. Optional: CodeRabbit `chill` profile for some paths (offered, not decided).

## 4. Housekeeping

- [ ] When audits are over: delete the Supabase audit account and the `AUDIT_EMAIL` / `AUDIT_PASSWORD` lines from `apps/boxing-gym-api/.env`.

## Reference

- Required checks on `main`: Boxing Gym test, Design System test, Announcement Web test, Announcement API test, CodeRabbit. `enforce_admins` on, force push off, PRs required (ruleset "Main PR Restrictions").
- All workflow actions are pinned to commit SHAs, with `persist-credentials: false` and `permissions: contents: read` (#34).
- Agent rules per project: `CLAUDE.md` at the root, `apps/boxing-gym-api/CLAUDE.md`, and each project's `design.md`.
