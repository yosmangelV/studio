"""Tests for scripts/check_migrations.py: rejects user writes, allows schema changes."""

import pytest

from scripts.check_migrations import MIGRATIONS, check, main


@pytest.mark.parametrize(
    "sql",
    [
        "insert into students (full_name) values ('x');",
        "INSERT INTO public.payments (amount) values (1);",
        "update students set level = 'beginner';",
        "update only public.students set is_active = false;",
        "delete from payments where true;",
        "truncate table students;",
        "merge into students s using x on true when matched then do nothing;",
        "copy students from stdin;",
        "insert into auth.users (email) values ('x');",
        "update auth.users set email = 'x';",
        "update auth . identities set provider = 'x';",
        'insert into "students" (full_name) values (\'x\');',
        'delete from "public"."payments" where true;',
        'update "auth"."users" set email = \'x\';',
        "select raw_app_meta_data from x;",
        "select jsonb_set(app_metadata, '{permissions}', '[]');",
        # Comment markers inside literals must not hide the code after them.
        "select 'a -- b'; delete from students where true;",
        "select '/* x'; update payments set amount = 0;",
        "select 'it''s -- fine'; insert into students (full_name) values ('x');",
        "select E'\\' -- '; delete from payments where true;",
        'select "odd--name" from x; delete from students where true;',
        "/* a /* nested */ still a comment */ delete from students where true;",
        "create function f() returns void language sql as $$ delete from students where true $$;",
    ],
)
def test_rejects_user_writes(tmp_path, sql):
    """Any write to user rows or user metadata is reported."""
    f = tmp_path / "999_bad.sql"
    f.write_text(sql)
    assert check(f)


@pytest.mark.parametrize(
    "sql",
    [
        "create trigger t before update on students for each row execute function f();",
        "alter table students add column x text;",
        "revoke all on students, payments from anon, authenticated;",
        "references auth.users(id)",
        "insert into gym_classes (name) values ('Boxeo');",
        "-- update students set level = 'x'\nselect 1;",
        "/* insert into payments\n values (1) */ select 1;",
        "create table students_archive (id uuid);",
        "grant select, update on students to service_role;",
        "create policy p on payments for update to service_role using (true);",
        "insert into gym_classes (name) values ('x') on conflict (name) do update set name = excluded.name;",
        "/* outer /* inner */ update students set level = 'x' */ select 1;",
        "comment on table students is 'see -- notes';",
        "select type'x'; -- delete from students",
    ],
)
def test_allows_schema_changes(tmp_path, sql):
    """Schema changes, gym data and commented-out writes pass."""
    f = tmp_path / "999_ok.sql"
    f.write_text(sql)
    assert check(f) == []


def test_reports_the_right_line(tmp_path):
    """Blanked comments keep their line breaks, so the reported line is exact."""
    f = tmp_path / "999_bad.sql"
    f.write_text("/* a\nb */\n-- c\ndelete from students where true;\n")
    assert check(f) == ["999_bad.sql:4: writes rows to students/payments: 'delete from students'"]


def test_repo_migrations_are_clean():
    """The migrations in the repo pass the check."""
    assert list(MIGRATIONS.glob("*.sql"))
    assert main([]) == 0
