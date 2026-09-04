from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Boxing Gym API"
    debug: bool = False

    supabase_url: str
    supabase_service_role_key: str
    supabase_jwks_url: str

    cors_origins: str = "http://localhost:4301"


settings = Settings()
