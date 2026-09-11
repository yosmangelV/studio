Load the skill at `.agents/skills/studio-code-reviewer/SKILL.md` and execute a full code review for this Studio monorepo.

## Usage

- `/code-review` → reviews **staged changes** (pre-commit)
- `/code-review --branch` → reviews **all commits on this branch vs `main`** (pre-push)
- `/code-review <PR_NUMBER>` → reviews a **GitHub pull request** (e.g. `/code-review 42`)

The argument (if any) is passed as `$ARGUMENTS`.

## Execution

Follow the skill exactly:

1. Parse `$ARGUMENTS` to determine the review mode (staged / branch / PR)
2. Get the list of changed files using the appropriate git/gh command
3. Discover and read all standards files from the project root
4. Detect which language stacks are involved
5. Read each changed file and its diff
6. Apply all relevant rules by stack
7. Output the structured review report

Do not skip steps. Do not summarize without reading the actual code.
