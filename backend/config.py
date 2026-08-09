import os
import socket
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
            # Check if specified MySQL database is reachable
            if "mysql" in self.DATABASE_URL:
                try:
                    import urllib.parse
                    parsed = urllib.parse.urlparse(self.DATABASE_URL)
                    host = parsed.hostname or self.DB_HOST or "127.0.0.1"
                    port = parsed.port or int(self.DB_PORT or 3306)

                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1.0)
                    res = sock.connect_ex((host, port))
                    sock.close()
                    if res == 0:
                        return self.DATABASE_URL
                    else:
                        # Fallback to local SQLite database when MySQL server is unreachable
                        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "easy_rental.db")
                        return f"sqlite:///{db_path}"
                except Exception:
                    pass
            return self.DATABASE_URL
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
