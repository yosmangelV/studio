import re
from datetime import date, time
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

_SEPARATORS = re.compile(r"[\s\-().]")


def _blank_to_none(value: object) -> object:
    return None if isinstance(value, str) and not value.strip() else value


class LocalizedText(BaseModel):
    """Translatable text. `es` is required; other locales fall back to it."""

    es: str = Field(..., min_length=1, max_length=300)
    en: Optional[str] = Field(None, max_length=300)

    @field_validator("es", "en", mode="before")
    @classmethod
    def strip(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("en", mode="after")
    @classmethod
    def empty_en_is_none(cls, value: Optional[str]) -> Optional[str]:
        return value or None


# ---- Profile ---------------------------------------------------------------------


class GymProfileUpdate(BaseModel):
    phone: Optional[str] = Field(None, description="E.164, e.g. +34658078039")
    whatsapp: Optional[str] = Field(None, description="Digits with country code, e.g. 34658078039")
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(None, max_length=200)
    instagram: Optional[str] = Field(None, description="Username without @")
    founded_on: Optional[date] = None
    active_students_min_display: int = Field(20, ge=1, le=1000)

    @field_validator("phone", "whatsapp", "email", "address", "instagram", mode="before")
    @classmethod
    def blank_is_none(cls, value: object) -> object:
        return _blank_to_none(value)

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        phone = _SEPARATORS.sub("", value)
        if not re.fullmatch(r"\+[1-9][0-9]{6,14}", phone):
            raise ValueError("phone must be in international format, e.g. +34658078039")
        return phone

    @field_validator("whatsapp")
    @classmethod
    def normalize_whatsapp(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        number = _SEPARATORS.sub("", value).removeprefix("+")
        if not re.fullmatch(r"[1-9][0-9]{6,14}", number):
            raise ValueError("whatsapp must be digits with country code, e.g. 34658078039")
        return number

    @field_validator("address")
    @classmethod
    def strip_address(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value else value

    @field_validator("instagram")
    @classmethod
    def normalize_instagram(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        handle = value.strip().removeprefix("@")
        if not re.fullmatch(r"[A-Za-z0-9._]{1,30}", handle):
            raise ValueError("instagram must be a username of up to 30 letters, digits, dots or underscores")
        return handle

    @field_validator("founded_on")
    @classmethod
    def not_in_future(cls, value: Optional[date]) -> Optional[date]:
        if value and value > date.today():
            raise ValueError("founded_on cannot be in the future")
        return value


class GymProfileResponse(GymProfileUpdate):
    updated_at: str


# ---- Schedule --------------------------------------------------------------------


class ScheduleSlot(BaseModel):
    day_from: int = Field(..., ge=1, le=7, description="ISO weekday, 1 = Monday")
    day_to: int = Field(..., ge=1, le=7)
    opens_at: time
    closes_at: time
    label: Optional[LocalizedText] = None
    sort_order: int = Field(0, ge=0)

    @model_validator(mode="after")
    def valid_ranges(self) -> "ScheduleSlot":
        if self.day_to < self.day_from:
            raise ValueError("day_to must be on or after day_from")
        if self.closes_at <= self.opens_at:
            raise ValueError("closes_at must be after opens_at")
        return self


class ScheduleSlotResponse(ScheduleSlot):
    id: str


class ScheduleUpdate(BaseModel):
    slots: list[ScheduleSlot] = Field(..., max_length=50)

    @model_validator(mode="after")
    def no_overlaps(self) -> "ScheduleUpdate":
        """Two slots of the same group may not share a day and overlap in time."""
        for i, a in enumerate(self.slots):
            for b in self.slots[i + 1:]:
                same_group = (a.label.es if a.label else None) == (b.label.es if b.label else None)
                share_day = a.day_from <= b.day_to and b.day_from <= a.day_to
                overlap = a.opens_at < b.closes_at and b.opens_at < a.closes_at
                if same_group and share_day and overlap:
                    raise ValueError(
                        f"slots overlap: {a.opens_at:%H:%M}-{a.closes_at:%H:%M} and {b.opens_at:%H:%M}-{b.closes_at:%H:%M}"
                    )
        return self


# ---- Classes ---------------------------------------------------------------------


class GymClassName(LocalizedText):
    es: str = Field(..., min_length=1, max_length=60)
    en: Optional[str] = Field(None, max_length=60)


class GymClass(BaseModel):
    name: GymClassName
    description: LocalizedText
    sort_order: int = Field(0, ge=0)
    is_active: bool = True


class GymClassResponse(GymClass):
    id: str


class ClassesUpdate(BaseModel):
    classes: list[GymClass] = Field(..., max_length=20)


# ---- Full profile ----------------------------------------------------------------


class GymProfileFull(BaseModel):
    profile: Optional[GymProfileResponse]
    schedule: list[ScheduleSlotResponse]
    classes: list[GymClassResponse]
