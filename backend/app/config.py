from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    DATABASE_URL: str = "sqlite:///./duolingo.db"
    DEBUG_DATE_HEADER: str = "X-Debug-Date"
    MAX_HEARTS: int = 5
    HEART_REGEN_HOURS: int = 4
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    ENABLE_DEV_ENDPOINTS: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
