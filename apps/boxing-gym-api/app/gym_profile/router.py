from fastapi import APIRouter, Depends
from app.auth import require_admin
from app.gym_profile.schemas import ClassesUpdate, GymProfileFull, GymProfileUpdate, ScheduleUpdate
from app.gym_profile import service

# Public reads go straight to Supabase (view public_gym_profile); every endpoint here is admin-only.
router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("", response_model=GymProfileFull)
def get_gym_profile():
    return service.get_full_profile()


@router.put("/profile", response_model=GymProfileFull)
def update_gym_profile(payload: GymProfileUpdate, user: dict = Depends(require_admin)):
    return service.update_profile(payload, updated_by=user["sub"])


@router.put("/schedule", response_model=GymProfileFull)
def replace_gym_schedule(payload: ScheduleUpdate):
    return service.replace_schedule(payload)


@router.put("/classes", response_model=GymProfileFull)
def replace_gym_classes(payload: ClassesUpdate):
    return service.replace_classes(payload)
