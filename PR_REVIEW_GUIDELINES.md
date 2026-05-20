# Pull Request Review Guidelines

## Review Philosophy

Reviews exist to:
- Protect long-term maintainability and scalability
- Share knowledge and raise the collective bar
- Reduce future technical debt before it enters the codebase

Reviews are collaborative, not personal. The goal is a better system, not a perfect author.

---

## What to Evaluate

### Architecture
- Are ownership boundaries respected?
- Does this scale with the design system growing?
- Is the abstraction justified, or is it premature?
- Is complexity increasing unnecessarily?
- Does the data flow remain predictable?

### Angular / Signals
- Is `OnPush` applied?
- Are signals used instead of manual state?
- Are there any method calls in templates?
- Are there any nested subscriptions?

### Design System
- Does the component follow Atomic Design placement?
- Are all values using design tokens?
- Is dark mode covered?
- Does the Storybook story cover all variants?
- Is the component exported from `public-api.ts`?

### Accessibility
- Is the WCAG AA bar met?
- Are focus states visible via `:focus-visible`?
- Are touch targets at least 44×44px?
- Is ARIA used only where native HTML can't express the semantics?

---

## PR Structure Rules

Prefer:
- Small, focused PRs — one concern per PR
- Separated refactors from feature work
- Separated formatting/style changes from logic changes
- Reviewable commits with clear messages

Avoid:
- Giant mixed-purpose PRs
- Hidden refactors bundled with features
- Unrelated changes in the same branch

---

## Commit Message Convention

```
type: short description (imperative, lowercase)

Types: feat | fix | refactor | style | docs | chore | test
```

Examples:
- `feat: add card molecule with elevated/outlined/flat variants`
- `fix: restore ng binary symlink in node_modules/.bin`
- `chore: add animation tokens to tokens.scss`

---

## Golden Rule

> A good PR should make the system easier to evolve, not harder.

If a PR closes a feature but makes the next one harder to build, it's not done yet.
