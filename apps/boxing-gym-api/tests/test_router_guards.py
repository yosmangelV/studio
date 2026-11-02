"""Every router mounted on the app must declare an auth guard at router level.

The API talks to Supabase with service_role (bypasses RLS), so a router without a guard
is open to the internet. This test fails for any router added without one.
"""
from app.auth import require_admin, require_instructor, require_student
from app.main import app

GUARDS = {require_admin, require_instructor, require_student}


def mounted_routers():
    return [r.original_router for r in app.routes if hasattr(r, "original_router")]


def test_routers_are_discovered():
    assert len(mounted_routers()) >= 4


def test_every_mounted_router_has_a_role_guard():
    unguarded = [
        [route.path for route in router.routes]
        for router in mounted_routers()
        if not any(dep.dependency in GUARDS for dep in router.dependencies)
    ]
    assert not unguarded, f"routers without a role guard: {unguarded}"
