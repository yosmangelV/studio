from typing import List
from postgrest.exceptions import APIError
from app.database import supabase
from app.students.schemas import StudentCreate, StudentUpdate

TABLE = "students"


class EmailAlreadyExistsError(Exception):
    pass


def get_all_students() -> List[dict]:
    response = supabase.table(TABLE).select("*").execute()
    return response.data


def get_student_by_id(student_id: str) -> dict | None:
    response = supabase.table(TABLE).select("*").eq("id", student_id).maybe_single().execute()
    return response.data


def create_student(payload: StudentCreate) -> dict:
    try:
        response = supabase.table(TABLE).insert(payload.model_dump(mode="json")).execute()
        return response.data[0]
    except APIError as e:
        if "23505" in str(e):
            raise EmailAlreadyExistsError()
        raise


def update_student(student_id: str, payload: StudentUpdate) -> dict | None:
    data = payload.model_dump(mode="json", exclude_none=True)
    response = supabase.table(TABLE).update(data).eq("id", student_id).execute()
    return response.data[0] if response.data else None


def delete_student(student_id: str) -> bool:
    response = supabase.table(TABLE).delete().eq("id", student_id).execute()
    return len(response.data) > 0
