import math
import secrets
import string
from typing import List
from postgrest.exceptions import APIError
from app.database import supabase
from app.students.schemas import StudentCreate, StudentUpdate

TABLE = "students"


class EmailAlreadyExistsError(Exception):
    pass


class AuthUserCreationError(Exception):
    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


def _build_permissions_map(auth_user_ids: list[str]) -> dict[str, list[str]]:
    if not auth_user_ids:
        return {}
    all_users = supabase.auth.admin.list_users()
    ids_set = set(auth_user_ids)
    return {
        str(u.id): (u.app_metadata or {}).get("permissions", [])
        for u in all_users
        if str(u.id) in ids_set
    }


def _attach_permissions(student: dict) -> dict:
    auth_id = student.get("auth_user_id")
    if auth_id:
        perms_map = _build_permissions_map([auth_id])
        student["permissions"] = perms_map.get(auth_id, [])
    else:
        student["permissions"] = []
    return student


def get_all_students(search: str | None = None, limit: int = 20, offset: int = 0) -> dict:
    query = supabase.table(TABLE).select("*", count="exact")
    if search:
        query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")
    query = query.range(offset, offset + limit - 1)
    response = query.execute()

    students = response.data
    total = response.count or 0

    auth_ids = [s["auth_user_id"] for s in students if s.get("auth_user_id")]
    perms_map = _build_permissions_map(auth_ids)
    for s in students:
        auth_id = s.get("auth_user_id")
        s["permissions"] = perms_map.get(auth_id, []) if auth_id else []

    return {
        "data": students,
        "total": total,
        "limit": limit,
        "offset": offset,
        "pages": math.ceil(total / limit) if limit > 0 else 0,
    }


def get_student_by_id(student_id: str) -> dict | None:
    response = supabase.table(TABLE).select("*").eq("id", student_id).maybe_single().execute()
    if response.data is None:
        return None
    return _attach_permissions(response.data)


def create_student(payload: StudentCreate) -> dict:
    auth_user_id: str | None = None

    if payload.system_access:
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        generated_password = "".join(secrets.choice(alphabet) for _ in range(16))
        try:
            result = supabase.auth.admin.create_user({
                "email": payload.email,
                "password": generated_password,
                "app_metadata": {"permissions": payload.system_access.permissions},
                "email_confirm": True,
            })
            auth_user_id = str(result.user.id)
        except Exception as e:
            raise AuthUserCreationError(str(e))

    student_data = payload.model_dump(mode="json", exclude={"system_access"})
    student_data["auth_user_id"] = auth_user_id

    try:
        response = supabase.table(TABLE).insert(student_data).execute()
        return response.data[0]
    except APIError as e:
        if auth_user_id:
            try:
                supabase.auth.admin.delete_user(auth_user_id)
            except Exception:
                pass
        if "23505" in str(e):
            raise EmailAlreadyExistsError()
        raise


def update_student(student_id: str, payload: StudentUpdate) -> dict | None:
    extra: dict = {}

    if payload.system_access:
        student = get_student_by_id(student_id)
        if student:
            if student.get("auth_user_id"):
                supabase.auth.admin.update_user_by_id(
                    student["auth_user_id"],
                    {"app_metadata": {"permissions": payload.system_access.permissions}},
                )
            else:
                email = student["email"]
                alphabet = string.ascii_letters + string.digits + "!@#$%"
                generated_password = "".join(secrets.choice(alphabet) for _ in range(16))
                try:
                    result = supabase.auth.admin.create_user({
                        "email": email,
                        "password": generated_password,
                        "app_metadata": {"permissions": payload.system_access.permissions},
                        "email_confirm": True,
                    })
                    extra["auth_user_id"] = str(result.user.id)
                except Exception as e:
                    raise AuthUserCreationError(str(e))

    data = payload.model_dump(mode="json", exclude_none=True, exclude={"system_access"})
    data.update(extra)
    if not data:
        return get_student_by_id(student_id)
    response = supabase.table(TABLE).update(data).eq("id", student_id).execute()
    return response.data[0] if response.data else None


def delete_student(student_id: str) -> bool:
    response = supabase.table(TABLE).delete().eq("id", student_id).execute()
    return len(response.data) > 0
