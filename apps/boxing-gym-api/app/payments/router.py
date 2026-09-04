from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth import require_admin
from app.payments.schemas import (
    PaymentCreate,
    PaymentResponse,
    PaginatedPayments,
    PaymentSummaryResponse,
    PaymentAnalyticsResponse,
)
from app.payments import service
from app.payments.service import PaymentAlreadyExistsError, StudentNotFoundError

router = APIRouter(dependencies=[Depends(require_admin)])
students_router = APIRouter(dependencies=[Depends(require_admin)])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, user: dict = Depends(require_admin)):
    try:
        return service.create_payment(payload, created_by=user["sub"])
    except StudentNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    except PaymentAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Payment already registered for this student and period")


@router.get("/summary", response_model=PaymentSummaryResponse)
def get_summary(period: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$")):
    if not period:
        today = date.today()
        period = f"{today.year:04d}-{today.month:02d}"
    return service.get_summary(period)


@router.get("/analytics", response_model=PaymentAnalyticsResponse)
def get_analytics(
    period: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    type: Optional[str] = Query(None, pattern=r"^(monthly_fee|material)$"),
):
    if not period:
        today = date.today()
        period = f"{today.year:04d}-{today.month:02d}"
    return service.get_analytics(period, type)


@router.get("/", response_model=PaginatedPayments)
def list_payments(
    type: Optional[str] = Query(None, pattern=r"^(monthly_fee|material)$"),
    period: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    student_id: Optional[str] = None,
    payment_method: Optional[str] = Query(None, pattern=r"^(cash|transfer|bizum)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    return service.get_payments(type, period, student_id, payment_method, limit, offset)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: str):
    payment = service.get_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: str):
    deleted = service.delete_payment(payment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")


@students_router.get("/{student_id}/payments", response_model=PaginatedPayments)
def get_student_payments(
    student_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    result = service.get_student_payments(student_id, limit, offset)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return result
