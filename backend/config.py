from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "SentinelAI"
    DEBUG: bool = True
    VERSION: str = "1.0.0"

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "sentinelai"

    REDIS_URL: str = "redis://localhost:6379"

    JWT_SECRET_KEY: str = "supersecretkey"  # change in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    CORS_ORIGINS: List[str] = ["*"]

    VIRUSTOTAL_API_KEY: str = ""
    ABUSEIPDB_API_KEY: str = ""
    SHODAN_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
