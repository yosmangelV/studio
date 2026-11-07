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

PERSONAL_TABLES = r"(?:public\s*\.\s*)?(?:students|payments)"
DML = r"(?:insert\s+into|update(?:\s+only)?|delete\s+from(?:\s+only)?|truncate(?:\s+table)?(?:\s+only)?|merge\s+into|copy)"

RULES = [
    (
        re.compile(rf"\b{DML}\s+{PERSONAL_TABLES}\b", re.IGNORECASE),
        "writes rows to students/payments",
    ),
    (
        re.compile(rf"\b{DML}\s+auth\s*\.", re.IGNORECASE),
        "writes rows to the auth schema",
    ),
    (
        re.compile(r"\b(?:raw_)?(?:app|user)_meta(?:data|_data)\b", re.IGNORECASE),
        "touches user metadata (permissions live there)",
    ),
]


def strip_comments(sql: str) -> str:
    """Blank out comments, keeping line breaks so line numbers stay right."""
    sql = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group()), sql, flags=re.DOTALL)
    return re.sub(r"--[^\n]*", "", sql)


def check(path: Path) -> list[str]:
    sql = strip_comments(path.read_text(encoding="utf-8"))
    problems = []
    for pattern, reason in RULES:
        for match in pattern.finditer(sql):
            line = sql.count("\n", 0, match.start()) + 1
            problems.append(f"{path.name}:{line}: {reason}: {match.group().strip()!r}")
    return problems


def main(argv: list[str]) -> int:
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
