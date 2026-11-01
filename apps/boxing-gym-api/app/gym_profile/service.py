from app.database import supabase
from app.gym_profile.schemas import ClassesUpdate, GymProfileUpdate, ScheduleUpdate

PROFILE_TABLE = "gym_profile"
SCHEDULE_TABLE = "gym_schedule_slots"
CLASSES_TABLE = "gym_classes"


def get_full_profile() -> dict:
    profile = supabase.table(PROFILE_TABLE).select("*").maybe_single().execute()
    schedule = supabase.table(SCHEDULE_TABLE).select("*").order("sort_order").execute()
    classes = supabase.table(CLASSES_TABLE).select("*").order("sort_order").execute()
    return {
        "profile": profile.data if profile else None,
        "schedule": schedule.data,
        "classes": classes.data,
    }


def update_profile(payload: GymProfileUpdate, updated_by: str) -> dict:
    row = {"id": True, **payload.model_dump(mode="json"), "updated_by": updated_by}
    supabase.table(PROFILE_TABLE).upsert(row).execute()
    return get_full_profile()


def replace_schedule(payload: ScheduleUpdate) -> dict:
    slots = [slot.model_dump(mode="json") for slot in payload.slots]
    supabase.rpc("replace_gym_schedule", {"slots": slots}).execute()
    return get_full_profile()


def replace_classes(payload: ClassesUpdate) -> dict:
    classes = [gym_class.model_dump(mode="json") for gym_class in payload.classes]
    supabase.rpc("replace_gym_classes", {"classes": classes}).execute()
    return get_full_profile()
