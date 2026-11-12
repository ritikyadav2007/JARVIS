import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App metadata
    app_name: str = "JARVIS Assistant Core"
    version: str = "0.1.0"
    api_prefix: str = "/api"

    # Server configuration
    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = True

    # Database configuration (Local SQLite)
    db_path: str = "data/jarvis.db"

    @property
    def resolved_db_path(self) -> str:
        """Always resolve db_path to backend/data/jarvis.db regardless of cwd."""
        if os.path.isabs(self.db_path):
            return self.db_path
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.normpath(os.path.join(backend_dir, self.db_path))

    # CORS — allow the Vite dev server
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Gemini AI configuration
    # Set GEMINI_API_KEY in backend/.env — never hardcode it here
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()

