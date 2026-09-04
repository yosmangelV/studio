from datetime import date
from typing import Optional
from postgrest.exceptions import APIError
from app.database import supabase
from app.payments.schemas import PaymentCreate

TABLE = "payments"
STUDENTS_TABLE = "students"


class PaymentAlreadyExistsError(Exception):
    pass


class StudentNotFoundError(Exception):
    pass


def create_payment(payload: PaymentCreate, created_by: str) -> dict:
    student = supabase.table(STUDENTS_TABLE).select("id").eq("id", payload.student_id).maybe_single().execute()
    if not student.data:
        raise StudentNotFoundError()

    data = payload.model_dump(mode="json")
    data["created_by"] = created_by

    try:
        response = supabase.table(TABLE).insert(data).execute()
        return response.data[0]
    except APIError as e:
        if "23505" in str(e):
            raise PaymentAlreadyExistsError()
        raise


def get_payments(
    type: Optional[str] = None,
    period: Optional[str] = None,
    student_id: Optional[str] = None,
    payment_method: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> dict:
    query = supabase.table(TABLE).select("*", count="exact")

    if type:
        query = query.eq("type", type)
    if student_id:
        query = query.eq("student_id", student_id)
    if payment_method:
        query = query.eq("payment_method", payment_method)
    if period:
        year, month = period.split("-")
        query = query.eq("period_year", int(year)).eq("period_month", int(month))

    response = query.range(offset, offset + limit - 1).execute()
    return {"data": response.data, "total": response.count, "limit": limit, "offset": offset}


def get_payment_by_id(payment_id: str) -> dict | None:
    response = supabase.table(TABLE).select("*").eq("id", payment_id).maybe_single().execute()
    return response.data


def delete_payment(payment_id: str) -> bool:
    response = supabase.table(TABLE).delete().eq("id", payment_id).execute()
    return len(response.data) > 0


def get_student_payments(student_id: str, limit: int = 20, offset: int = 0) -> dict | None:
    student = supabase.table(STUDENTS_TABLE).select("id").eq("id", student_id).maybe_single().execute()
    if not student.data:
        return None

    response = (
        supabase.table(TABLE)
        .select("*", count="exact")
        .eq("student_id", student_id)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"data": response.data, "total": response.count, "limit": limit, "offset": offset}


def get_summary(period: str) -> dict:
    year, month = map(int, period.split("-"))
    today = date.today()

    students_resp = supabase.table(STUDENTS_TABLE).select("id, full_name").eq("is_active", True).execute()
    all_students = students_resp.data

    payments_resp = (
        supabase.table(TABLE)
        .select("student_id, paid_at, amount")
        .eq("type", "monthly_fee")
        .eq("period_year", year)
        .eq("period_month", month)
        .execute()
    )
    paid_map = {p["student_id"]: p for p in payments_resp.data}

    prev_year, prev_month = (year - 1, 12) if month == 1 else (year, month - 1)
    prev_resp = (
        supabase.table(TABLE)
        .select("student_id")
        .eq("type", "monthly_fee")
        .eq("period_year", prev_year)
        .eq("period_month", prev_month)
        .execute()
    )
    prev_paid_ids = {p["student_id"] for p in prev_resp.data}

    paid, pending, overdue, at_risk = [], [], [], []
    is_current_month = today.year == year and today.month == month

    for student in all_students:
        sid = student["id"]
        name = student["full_name"]

        if sid in paid_map:
            p = paid_map[sid]
            paid.append({"student_id": sid, "student_name": name, "paid_at": p["paid_at"], "amount": p["amount"]})
        else:
            if is_current_month and today.day <= 5:
                pending.append({"student_id": sid, "student_name": name})
            else:
                overdue.append({"student_id": sid, "student_name": name})

            if sid not in prev_paid_ids:
                at_risk.append({"student_id": sid, "student_name": name, "months_unpaid": 2})

    return {"period": period, "paid": paid, "pending": pending, "overdue": overdue, "at_risk_of_inactivity": at_risk}


def get_analytics(period: str, type: Optional[str] = None) -> dict:
    year, month = map(int, period.split("-"))
    start = f"{year:04d}-{month:02d}-01"
    end_year, end_month = (year + 1, 1) if month == 12 else (year, month + 1)
    end = f"{end_year:04d}-{end_month:02d}-01"

    # monthly_fee uses period_year/period_month to avoid UTC timezone drift on paid_at
    # material has no period fields so it uses paid_at
    if type == "monthly_fee":
        payments = (
            supabase.table(TABLE)
            .select("payment_method, amount")
            .eq("type", "monthly_fee")
            .eq("period_year", year)
            .eq("period_month", month)
            .execute()
            .data
        )
    elif type == "material":
        payments = (
            supabase.table(TABLE)
            .select("payment_method, amount")
            .eq("type", "material")
            .gte("paid_at", start)
            .lt("paid_at", end)
            .execute()
            .data
        )
    else:
        monthly = (
            supabase.table(TABLE)
            .select("payment_method, amount")
            .eq("type", "monthly_fee")
            .eq("period_year", year)
            .eq("period_month", month)
            .execute()
            .data
        )
        material = (
            supabase.table(TABLE)
            .select("payment_method, amount")
            .eq("type", "material")
            .gte("paid_at", start)
            .lt("paid_at", end)
            .execute()
            .data
        )
        payments = monthly + material
    by_method = {m: {"count": 0, "amount": 0.0} for m in ("cash", "transfer", "bizum")}
    total = 0.0

    for p in payments:
        m = p["payment_method"]
        a = float(p["amount"])
        by_method[m]["count"] += 1
        by_method[m]["amount"] += a
        total += a

    return {
        "period": period,
        "total_amount": round(total, 2),
        "total_payments": len(payments),
        "by_method": by_method,
    }
