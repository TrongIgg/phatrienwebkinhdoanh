from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tho Platform Backend"
    app_env: str = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///db/tho_demo.sqlite"
    jwt_secret: str = ""
    jwt_expire_minutes: int = 120
    image_api_provider: str = "mock"
    image_api_key: str = ""
    redis_url: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
