"""
Limpia la base de datos de desarrollo.

  - payments  → borra todos los registros (FK requiere borrar antes que students)
  - students  → borra todos los registros
  - auth.users → elimina todos excepto el usuario con permiso 'admin'

Uso:
    uv run python scripts/seed_reset.py
    uv run python scripts/seed_reset.py --dry-run
"""

import argparse
import sys
from pathlib import Path

# Allow running from project root or scripts/ directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import supabase  # noqa: E402 — needs sys.path patched first


def reset(dry_run: bool = False) -> None:
    tag = "[DRY RUN] " if dry_run else ""

    # ── 1. Delete all payments (FK blocks student deletion) ───────────
    payments = supabase.table("payments").select("id").execute()
    pay_count = len(payments.data)

    if pay_count == 0:
        print("payments: nothing to delete")
    else:
        print(f"payments: {tag}deleting {pay_count} record(s)…")
        if not dry_run:
            supabase.table("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print("  ✓ done")

    # ── 2. Delete all students ────────────────────────────────────────
    students = supabase.table("students").select("id, full_name, email").execute()
    count = len(students.data)

    if count == 0:
        print("students: nothing to delete")
    else:
        print(f"students: {tag}deleting {count} record(s)…")
        for s in students.data:
            print(f"  · {s['full_name']} <{s['email']}>")
        if not dry_run:
            supabase.table("students").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print("  ✓ done")

    # ── 3. Clean auth users (keep the admin) ─────────────────────────
    all_users = supabase.auth.admin.list_users()

    admin_users = [u for u in all_users if "admin" in (u.app_metadata or {}).get("permissions", [])]
    to_delete   = [u for u in all_users if "admin" not in (u.app_metadata or {}).get("permissions", [])]

    if not admin_users:
        print("\nWARNING: no user with 'admin' permission found — aborting user cleanup to avoid locking yourself out")
        return

    if len(admin_users) > 1:
        print("\nWARNING: multiple admin users found, keeping all of them:")
        for u in admin_users:
            print(f"  · {u.email}")

    for u in admin_users:
        perms = (u.app_metadata or {}).get("permissions", [])
        print(f"\nauth.users: keeping {u.email} (permissions: {perms})")

    if not to_delete:
        print("auth.users: no other users to delete")
        return

    print(f"\nauth.users: {tag}deleting {len(to_delete)} user(s)…")
    for u in to_delete:
        p = (u.app_metadata or {}).get("permissions", [])
        print(f"  · {u.email}  [{', '.join(p) or 'no permissions'}]")

    if not dry_run:
        for u in to_delete:
            supabase.auth.admin.delete_user(str(u.id))
        print("  ✓ done")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reset dev database")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    args = parser.parse_args()

    if not args.dry_run:
        confirm = input("\n⚠️  This will DELETE all students and non-admin auth users. Continue? [y/N] ")
        if confirm.lower() != "y":
            print("Aborted.")
            sys.exit(0)

    print()
    reset(dry_run=args.dry_run)
    print("\nDone.")
