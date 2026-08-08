from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )

    PROJECT_NAME: str = "Rental Management System"
    API_V1_STR: str = "/api"
    
    # JWT Settings
    SECRET_KEY: str = "change_me_to_a_secure_secret_key_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720  # 12 hours (60 * 12)
    
    # Database Settings
    # MySQL default connection string
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/rental_db"
    
    # Security Settings
    SECURE_COOKIE: bool = False  # Set to True in production to enforce HTTPS
    
    # CORS Origins (JSON array or comma-separated list)
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

settings = Settings()
