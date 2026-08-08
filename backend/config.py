import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyRental"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database configuration
    DB_USER: str = "root"
    DB_PASSWORD: str = "32"
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_NAME: str = "easy-rental"
    DATABASE_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
