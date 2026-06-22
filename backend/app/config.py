"""
Central application configuration.
All values are sourced from environment variables (see .env.example).
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    # Database
    # NOTE: a bare relative sqlite URL (sqlite:///instance/foo.db) resolves
    # against the process's current working directory, not this file's
    # location — which breaks depending on where `python run.py` is
    # launched from. So relative sqlite URLs from .env are ignored in favor
    # of an absolute path; only an explicit absolute sqlite URL or a
    # non-sqlite URL (e.g. Postgres in production) is honored from .env.
    _env_db_url = os.getenv("DATABASE_URL", "")
    _is_relative_sqlite = _env_db_url.startswith("sqlite:///") and not _env_db_url.startswith("sqlite:////")
    if _env_db_url and not _is_relative_sqlite:
        SQLALCHEMY_DATABASE_URI = _env_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'resume_analyzer.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 60))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv("UPLOAD_FOLDER", "app/uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH_MB", 10)) * 1024 * 1024
    ALLOWED_EXTENSIONS = {"pdf", "docx"}

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
