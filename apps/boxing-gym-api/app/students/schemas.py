from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class StudentLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class StudentBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    birth_date: date
    enrollment_date: date
    level: StudentLevel
    is_active: bool = True
    weight: Optional[float] = Field(None, gt=0)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    birth_date: Optional[date] = None
    level: Optional[StudentLevel] = None
    is_active: Optional[bool] = None
    weight: Optional[float] = Field(None, gt=0)


class StudentResponse(StudentBase):
    id: str
    created_at: str
    updated_at: str
