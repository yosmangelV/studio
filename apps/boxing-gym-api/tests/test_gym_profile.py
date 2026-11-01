import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.auth import get_current_user, require_admin
from app.gym_profile import service
from app.gym_profile.router import router as gym_profile_router
from app.gym_profile.schemas import GymProfileUpdate, ScheduleSlot, ScheduleUpdate
from app.main import app

ADMIN = {"sub": "admin-uuid", "app_metadata": {"permissions": ["admin"]}}
STUDENT = {"sub": "student-uuid", "app_metadata": {"permissions": ["student"]}}

FULL_PROFILE = {
    "profile": {
        "phone": "+34658078039",
        "whatsapp": "34658078039",
        "email": None,
        "address": "C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid",
        "instagram": None,
        "founded_on": "2024-01-01",
        "active_students_min_display": 20,
        "updated_at": "2026-10-31T10:00:00+00:00",
    },
    "schedule": [
        {"id": "s1", "day_from": 1, "day_to": 5, "opens_at": "18:30:00", "closes_at": "19:30:00",
         "label": {"es": "Adultos", "en": "Adults"}, "sort_order": 0},
    ],
    "classes": [
        {"id": "c1", "name": {"es": "Boxeo", "en": "Boxing"}, "description": {"es": "Técnica"},
         "sort_order": 0, "is_active": True},
    ],
}


@pytest.fixture
def client():
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def as_admin():
    app.dependency_overrides[get_current_user] = lambda: ADMIN


@pytest.fixture
def fake_service(monkeypatch):
    calls = {}

    def record(name):
        def fn(*args, **kwargs):
            calls[name] = (args, kwargs)
            return FULL_PROFILE
        return fn

    for name in ("get_full_profile", "update_profile", "replace_schedule", "replace_classes"):
        monkeypatch.setattr(service, name, record(name))
    return calls


# ---- Auth ------------------------------------------------------------------------


def test_rejects_requests_without_token(client):
    assert client.get("/gym-profile").status_code in (401, 403)


def test_rejects_non_admin(client, fake_service):
    app.dependency_overrides[get_current_user] = lambda: STUDENT
    assert client.get("/gym-profile").status_code == 403
    assert client.put("/gym-profile/schedule", json={"slots": []}).status_code == 403
    assert fake_service == {}


def test_router_level_admin_guard_covers_every_route():
    # A router-level dependency applies to every route, including ones added later.
    assert any(dep.dependency is require_admin for dep in gym_profile_router.dependencies)
    assert len(gym_profile_router.routes) == 4


# ---- Endpoints -------------------------------------------------------------------


def test_get_returns_full_profile(client, as_admin, fake_service):
    response = client.get("/gym-profile")
    assert response.status_code == 200
    assert response.json()["profile"]["phone"] == "+34658078039"


def test_update_profile_records_admin(client, as_admin, fake_service):
    response = client.put("/gym-profile/profile", json={"phone": "+34 658 07 80 39", "instagram": "@arte"})
    assert response.status_code == 200
    (payload,), kwargs = fake_service["update_profile"]
    assert payload.phone == "+34658078039"
    assert payload.instagram == "arte"
    assert kwargs == {"updated_by": "admin-uuid"}


def test_replace_schedule_validates_before_service(client, as_admin, fake_service):
    bad = {"slots": [{"day_from": 1, "day_to": 5, "opens_at": "19:00", "closes_at": "18:00"}]}
    assert client.put("/gym-profile/schedule", json=bad).status_code == 422
    assert "replace_schedule" not in fake_service


def test_replace_classes(client, as_admin, fake_service):
    body = {"classes": [{"name": {"es": "Juniors"}, "description": {"es": "Para los pequeños"}}]}
    assert client.put("/gym-profile/classes", json=body).status_code == 200
    (payload,), _ = fake_service["replace_classes"]
    assert payload.classes[0].is_active is True


# ---- Validation ------------------------------------------------------------------


def test_profile_blank_fields_become_none():
    profile = GymProfileUpdate(phone=" ", email="", address="  ", instagram="")
    assert (profile.phone, profile.email, profile.address, profile.instagram) == (None, None, None, None)


def test_whatsapp_normalized_to_digits():
    assert GymProfileUpdate(whatsapp="+34 658-078-039").whatsapp == "34658078039"


@pytest.mark.parametrize("phone", ["658078039", "+0123456789", "+34 abc"])
def test_rejects_invalid_phone(phone):
    with pytest.raises(ValidationError):
        GymProfileUpdate(phone=phone)


def test_rejects_future_founding_date():
    with pytest.raises(ValidationError):
        GymProfileUpdate(founded_on=date.today() + timedelta(days=1))


def test_rejects_day_range_backwards():
    with pytest.raises(ValidationError):
        ScheduleSlot(day_from=5, day_to=1, opens_at="10:00", closes_at="11:00")


def test_rejects_overlapping_slots_in_same_group():
    with pytest.raises(ValidationError, match="overlap"):
        ScheduleUpdate(slots=[
            {"day_from": 1, "day_to": 5, "opens_at": "18:00", "closes_at": "19:30", "label": {"es": "Adultos"}},
            {"day_from": 3, "day_to": 3, "opens_at": "19:00", "closes_at": "20:00", "label": {"es": "Adultos"}},
        ])


def test_allows_contiguous_and_cross_group_slots():
    ScheduleUpdate(slots=[
        {"day_from": 1, "day_to": 5, "opens_at": "18:30", "closes_at": "19:30", "label": {"es": "Adultos"}},
        {"day_from": 1, "day_to": 5, "opens_at": "19:30", "closes_at": "20:30", "label": {"es": "Adultos"}},
        {"day_from": 1, "day_to": 5, "opens_at": "18:30", "closes_at": "19:30", "label": {"es": "Juniors"}},
    ])
