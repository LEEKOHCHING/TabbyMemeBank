@echo off
:: TABBY MEME BANK - Backend Startup Script
:: Uses system Python directly (no virtual environment)

title TABBY MEME BANK - Sophia Backend

echo ================================================
echo   TABBY MEME BANK - Python FastAPI Backend
echo   AI Bank President: Sophia
echo ================================================

:: Navigate to backend directory
cd /d "%~dp0..\backend"

:: Check .env file
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo         Please copy .env.example to backend\.env and fill in your credentials.
    pause
    exit /b 1
)

echo [OK] Starting FastAPI server on port 8000...
echo [OK] Press Ctrl+C to stop

:: Start FastAPI with system Python
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --log-level info

pause
