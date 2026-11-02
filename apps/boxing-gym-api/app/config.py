from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # .env also holds values only the scripts use (SUPABASE_DB_URL for dump_schema.sh).
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Boxing Gym API"
    debug: bool = False

    supabase_url: str
    supabase_service_role_key: str
    supabase_jwks_url: str

    cors_origins: str = "http://localhost:4301"


settings = Settings()
