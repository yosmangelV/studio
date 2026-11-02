"""Who may do what on /students: admins everything, instructors read only, students nothing.

Writes carry `system_access.permissions`, so letting a non-admin write would let them grant
themselves (or anyone) admin.
"""
import pytest
from fastapi.testclient import TestClient

from app.auth import get_current_user
from app.main import app
from app.students import service

STUDENT_ROW = {
    "id": "s1",
    "full_name": "Alumno Uno",
    "email": "uno@example.com",
    "phone": None,
    "birth_date": "2000-01-01",
    "enrollment_date": "2024-01-01",
    "level": "beginner",
    "is_active": True,
    "weight": None,
    "auth_user_id": None,
    "permissions": [],
    "created_at": "2026-01-01T00:00:00+00:00",
    "updated_at": "2026-01-01T00:00:00+00:00",
}
PAGE = {"data": [STUDENT_ROW], "total": 1, "limit": 20, "offset": 0, "pages": 1}
NEW_STUDENT = {
    "full_name": "Alumna Dos",
    "email": "dos@example.com",
    "birth_date": "2001-01-01",
    "enrollment_date": "2024-01-01",
    "level": "beginner",
    "system_access": {"permissions": ["admin"]},
}


def user(*permissions: str) -> dict:
    return {"sub": "user-uuid", "app_metadata": {"permissions": list(permissions)}}


ADMIN, INSTRUCTOR, STUDENT, NO_ROLE = user("admin"), user("instructor"), user("student"), user()

REQUESTS = {
    "list": ("get", "/students/", None),
    "get": ("get", "/students/s1", None),
    "create": ("post", "/students/", NEW_STUDENT),
    "update": ("patch", "/students/s1", {"system_access": {"permissions": ["admin"]}}),
    "delete": ("delete", "/students/s1", None),
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(service, "get_all_students", lambda **_: PAGE)
    monkeypatch.setattr(service, "get_student_by_id", lambda _id: STUDENT_ROW)
    monkeypatch.setattr(service, "create_student", lambda _payload: STUDENT_ROW)
    monkeypatch.setattr(service, "update_student", lambda _id, _payload: STUDENT_ROW)
    monkeypatch.setattr(service, "delete_student", lambda _id: True)
    yield TestClient(app)
    app.dependency_overrides.clear()


def call(client: TestClient, who: dict, action: str):
    app.dependency_overrides[get_current_user] = lambda: who
    method, path, body = REQUESTS[action]
    return client.request(method, path, json=body)


@pytest.mark.parametrize("action", REQUESTS)
def test_admin_can_do_everything(client, action):
    assert call(client, ADMIN, action).status_code < 300


@pytest.mark.parametrize("action", ["list", "get"])
def test_instructor_can_read(client, action):
    assert call(client, INSTRUCTOR, action).status_code == 200


@pytest.mark.parametrize("action", ["create", "update", "delete"])
def test_instructor_cannot_write(client, action):
    assert call(client, INSTRUCTOR, action).status_code == 403


@pytest.mark.parametrize("who", [STUDENT, NO_ROLE], ids=["student", "no-role"])
@pytest.mark.parametrize("action", REQUESTS)
def test_students_and_users_without_role_get_nothing(client, who, action):
    assert call(client, who, action).status_code == 403


@pytest.mark.parametrize("action", REQUESTS)
def test_requires_a_token(action):
    method, path, body = REQUESTS[action]
    assert TestClient(app).request(method, path, json=body).status_code in (401, 403)
