from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    DATABASE_URL: str = "sqlite:///./duolingo.db"
    DEBUG_DATE_HEADER: str = "X-Debug-Date"
    MAX_HEARTS: int = 5
    HEART_REGEN_HOURS: int = 4

    class Config:
        env_file = ".env"

settings = Settings()