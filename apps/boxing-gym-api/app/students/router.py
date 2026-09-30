from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth import get_current_user
from app.students.schemas import StudentCreate, StudentUpdate, StudentResponse, PaginatedStudents
from app.students import service
from app.students.service import AuthUserCreationError, EmailAlreadyExistsError

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/", response_model=PaginatedStudents)
def list_students(
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return service.get_all_students(search=search, limit=limit, offset=offset)


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate):
    try:
        return service.create_student(payload)
    except EmailAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    except AuthUserCreationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not create system user: {e.detail}")


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str):
    student = service.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.patch("/{student_id}", response_model=StudentResponse)
def update_student(student_id: str, payload: StudentUpdate):
    student = service.update_student(student_id, payload)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: str):
    deleted = service.delete_student(student_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
