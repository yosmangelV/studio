"""Fail when a migration writes user data.

Users, students and payments are created and changed on demand outside the
repo (through the panel or by hand), never from a migration. Schema changes
(create, alter, grant, triggers) are fine; rows are not.

Usage:
    python3 scripts/check_migrations.py [file.sql ...]

Without arguments it checks every file in migrations/. Standard library only,
so CI can run it without installing the project.
"""

import re
import sys
from pathlib import Path

MIGRATIONS = Path(__file__).resolve().parent.parent / "migrations"

# Identifiers may be quoted ("public"."students").
PERSONAL_TABLES = r'(?:"?public"?\s*\.\s*)?"?(?:students|payments)\b'
DML = r"(?:insert\s+into|update(?:\s+only)?|delete\s+from(?:\s+only)?|truncate(?:\s+table)?(?:\s+only)?|merge\s+into|copy)"

RULES = [
    (
        re.compile(rf"\b{DML}\s+{PERSONAL_TABLES}", re.IGNORECASE),
        "writes rows to students/payments",
    ),
    (
        re.compile(rf'\b{DML}\s+"?auth"?\s*\.', re.IGNORECASE),
        "writes rows to the auth schema",
    ),
    (
        re.compile(r"\b(?:raw_)?(?:app|user)_meta(?:data|_data)\b", re.IGNORECASE),
        "touches user metadata (permissions live there)",
    ),
]


def _blank(text: str) -> str:
    """Replace everything but line breaks with spaces."""
    return re.sub(r"[^\n]", " ", text)


def _quoted_end(sql: str, start: int, quote: str, backslash: bool) -> int:
    """Index just past the literal opened at `start`; a doubled quote is an escaped one."""
    i = start + 1
    while i < len(sql):
        if backslash and sql[i] == "\\":
            i += 2
        elif sql[i] == quote:
            if sql[i + 1 : i + 2] != quote:
                return i + 1
            i += 2
        else:
            i += 1
    return len(sql)


def strip_comments(sql: str) -> str:
    """Blank out comments, keeping line breaks so line numbers stay right.

    String literals and quoted identifiers are kept as they are, so a `--` or
    `/*` inside them does not hide the code after it. Dollar-quoted bodies
    ($$ ... $$) are left as code on purpose: a function body that writes user
    rows is still a write.
    """
    out = []
    i = 0
    while i < len(sql):
        two = sql[i : i + 2]
        if two == "--":
            end = sql.find("\n", i)
            end = len(sql) if end == -1 else end
            out.append(_blank(sql[i:end]))
            i = end
        elif two == "/*":
            # Postgres block comments nest.
            depth, j = 1, i + 2
            while j < len(sql) and depth:
                if sql[j : j + 2] == "/*":
                    depth, j = depth + 1, j + 2
                elif sql[j : j + 2] == "*/":
                    depth, j = depth - 1, j + 2
                else:
                    j += 1
            out.append(_blank(sql[i:j]))
            i = j
        elif sql[i] in "'\"":
            # E'...' strings take backslash escapes; `type'x'` does not.
            escape_string = (
                sql[i] == "'"
                and sql[i - 1 : i] in ("e", "E")
                and not re.match(r"[\w$]", sql[i - 2 : i - 1])
            )
            end = _quoted_end(sql, i, sql[i], backslash=escape_string)
            out.append(sql[i:end])
            i = end
        else:
            out.append(sql[i])
            i += 1
    return "".join(out)


def check(path: Path) -> list[str]:
    """List every rule violation in one migration as `file:line: reason: match`."""
    sql = strip_comments(path.read_text(encoding="utf-8"))
    problems = []
    for pattern, reason in RULES:
        for match in pattern.finditer(sql):
            line = sql.count("\n", 0, match.start()) + 1
            problems.append(f"{path.name}:{line}: {reason}: {match.group().strip()!r}")
    return problems


def main(argv: list[str]) -> int:
    """Check the given files, or every migration; return the process exit code."""
    files = [Path(a) for a in argv] or sorted(MIGRATIONS.glob("*.sql"))
    problems = [p for f in files for p in check(f)]
    for problem in problems:
        print(problem, file=sys.stderr)
    if problems:
        print(
            "\nMigrations change schema only. Create or update users, students and "
            "payments outside the repo, on demand.",
            file=sys.stderr,
        )
        return 1
    print(f"OK: {len(files)} migration(s), no user data written.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
