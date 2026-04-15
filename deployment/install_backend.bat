@echo off
:: TABBY MEME BANK - Backend Installation Script

title TABBY MEME BANK - Backend Setup

echo ================================================
echo   TABBY MEME BANK - Backend Installation
echo ================================================

cd /d "%~dp0..\backend"

:: Create virtual environment
echo [1/4] Creating Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate.bat

:: Upgrade pip
echo [2/4] Upgrading pip...
python -m pip install --upgrade pip

:: Install dependencies
echo [3/4] Installing dependencies...
pip install -r requirements.txt

:: Install ODBC Driver 17 reminder
echo.
echo [4/4] IMPORTANT: Ensure these are installed on Windows Server:
echo   - Microsoft ODBC Driver 17 for SQL Server
echo   - Download: https://go.microsoft.com/fwlink/?linkid=2168524
echo.

:: Copy .env template
if not exist ".env" (
    if exist "..\\.env.example" (
        copy "..\\.env.example" ".env"
        echo [OK] .env file created from template - PLEASE CONFIGURE IT!
    )
)

echo.
echo ================================================
echo   Installation complete!
echo   Next steps:
echo   1. Configure backend\.env with your credentials
echo   2. Run database\schema.sql on your MSSQL server
echo   3. Run start_backend.bat to start the API
echo ================================================
pause
