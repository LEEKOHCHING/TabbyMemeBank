from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_secret_key: str = "change-me-in-production"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Anthropic
    anthropic_api_key: str
    anthropic_model: str = "claude-haiku-4-5-20251001"
    humanize_model: str = "claude-sonnet-4-5"

    # MSSQL
    mssql_server: str
    mssql_database: str
    mssql_user: str
    mssql_password: str

    # BSC
    bsc_rpc_url: str
    tabby_contract_address: str = "0x319558c8aD708dc42f45ab70eADA4750d6c942d7"
    tabby_decimals: int = 18

    # Twitter
    twitter_bearer_token: str = ""
    twitter_client_id: str = ""
    twitter_client_secret: str = ""
    twitter_api_key: str = ""
    twitter_api_secret: str = ""
    twitter_access_token: str = ""
    twitter_access_token_secret: str = ""
    twitter_kol_list: str = ""

    # Google Gemini
    google_api_key: str = ""

    # Sophia Wallet
    sophia_bsc_address: str
    sophia_bsc_private_key: str
    sophia_sol_address: str = ""
    sophia_sol_private_key: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def mssql_connection_string(self) -> str:
        return (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={self.mssql_server};"
            f"DATABASE={self.mssql_database};"
            f"UID={self.mssql_user};"
            f"PWD={self.mssql_password}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
