from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    SECRET_KEY: str = "a_very_secret_key_for_jwt_tokens"
    GEMINI_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
