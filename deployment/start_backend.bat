@echo off
:: TABBY MEME BANK - Backend Startup Script
:: Run as Administrator

title TABBY MEME BANK - Sophia Backend

echo ================================================
echo   TABBY MEME BANK - Python FastAPI Backend
echo   AI Bank President: Sophia
echo ================================================

:: Navigate to backend directory
cd /d "%~dp0..\backend"

:: Activate virtual environment (if exists)
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo [WARN] No virtual environment found, using system Python
)

:: Check .env file
if not exist ".env" (
    echo [ERROR] .env file not found! Copy .env.example to .env and configure it.
    pause
    exit /b 1
)

echo [OK] Starting FastAPI server on port 8000...
echo [OK] Press Ctrl+C to stop

:: Start FastAPI with uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

pause
