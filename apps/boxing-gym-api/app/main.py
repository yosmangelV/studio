from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.students.router import router as students_router
from app.payments.router import router as payments_router
from app.payments.router import students_router as payments_students_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router, prefix="/students", tags=["students"])
app.include_router(payments_router, prefix="/payments", tags=["payments"])
app.include_router(payments_students_router, prefix="/students", tags=["payments"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
