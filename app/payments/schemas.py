from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class PaymentType(str, Enum):
    monthly_fee = "monthly_fee"
    material = "material"


class PaymentMethod(str, Enum):
    cash = "cash"
    transfer = "transfer"
    bizum = "bizum"


class PaymentCreate(BaseModel):
    student_id: str
    type: PaymentType
    period_year: Optional[int] = Field(None, ge=2020)
    period_month: Optional[int] = Field(None, ge=1, le=12)
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_type_fields(self):
        if self.type == PaymentType.monthly_fee:
            if self.period_year is None or self.period_month is None:
                raise ValueError("period_year and period_month are required for monthly_fee payments")
        if self.type == PaymentType.material:
            if not self.notes or not self.notes.strip():
                raise ValueError("notes is required for material payments")
        return self


class PaymentResponse(BaseModel):
    id: str
    student_id: str
    type: PaymentType
    period_year: Optional[int]
    period_month: Optional[int]
    amount: float
    payment_method: PaymentMethod
    paid_at: str
    created_by: str
    notes: Optional[str]
    created_at: str


class PaginatedPayments(BaseModel):
    data: List[PaymentResponse]
    total: int
    limit: int
    offset: int


class PaidStudentInfo(BaseModel):
    student_id: str
    student_name: str
    paid_at: str
    amount: float


class UnpaidStudentInfo(BaseModel):
    student_id: str
    student_name: str


class AtRiskStudentInfo(BaseModel):
    student_id: str
    student_name: str
    months_unpaid: int


class PaymentSummaryResponse(BaseModel):
    period: str
    paid: List[PaidStudentInfo]
    pending: List[UnpaidStudentInfo]
    overdue: List[UnpaidStudentInfo]
    at_risk_of_inactivity: List[AtRiskStudentInfo]


class MethodStats(BaseModel):
    count: int
    amount: float


class PaymentAnalyticsResponse(BaseModel):
    period: str
    total_amount: float
    total_payments: int
    by_method: dict[str, MethodStats]
