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
        "select raw_app_meta_data from x;",
        "select jsonb_set(app_metadata, '{permissions}', '[]');",
    ],
)
def test_rejects_user_writes(tmp_path, sql):
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
    ],
)
def test_allows_schema_changes(tmp_path, sql):
    f = tmp_path / "999_ok.sql"
    f.write_text(sql)
    assert check(f) == []


def test_reports_the_right_line(tmp_path):
    f = tmp_path / "999_bad.sql"
    f.write_text("/* a\nb */\n-- c\ndelete from students where true;\n")
    assert check(f) == ["999_bad.sql:4: writes rows to students/payments: 'delete from students'"]


def test_repo_migrations_are_clean():
    assert list(MIGRATIONS.glob("*.sql"))
    assert main([]) == 0
