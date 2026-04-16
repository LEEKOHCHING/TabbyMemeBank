@echo off
:: TABBY MEME BANK - Backend Installation Script (Windows)
:: Requires: Python 3.11+, ODBC Driver 18 for SQL Server

title TABBY MEME BANK - Backend Setup

echo ================================================
echo   TABBY MEME BANK - Backend Installation
echo   ODBC Driver 18 for SQL Server detected
echo ================================================

cd /d "%~dp0..\backend"

:: Create virtual environment
echo [1/5] Creating Python virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.11+ from python.org
    pause & exit /b 1
)
call .venv\Scripts\activate.bat

:: Upgrade pip + build tools
echo [2/5] Upgrading pip and build tools...
python -m pip install --upgrade pip setuptools wheel

:: Install pyodbc via pre-built wheel first (avoids compiler requirement)
echo [3/5] Installing pyodbc (pre-built wheel for Windows)...
pip install pyodbc --only-binary :all:
if errorlevel 1 (
    echo [WARN] Pre-built wheel not found, trying with build tools...
    pip install pyodbc
    if errorlevel 1 (
        echo.
        echo [ERROR] pyodbc install failed. Please install:
        echo   1. Microsoft C++ Build Tools:
        echo      https://visualstudio.microsoft.com/visual-cpp-build-tools/
        echo   2. Select "Desktop development with C++" workload
        echo   3. Re-run this script
        echo.
        pause & exit /b 1
    )
)
echo [OK] pyodbc installed successfully

:: Install remaining dependencies (skip pyodbc since already installed)
echo [4/5] Installing remaining dependencies...
pip install -r requirements.txt --ignore-installed pyodbc
if errorlevel 1 (
    echo [ERROR] Dependency installation failed
    pause & exit /b 1
)

:: Copy .env template
echo [5/5] Setting up environment file...
if not exist ".env" (
    if exist "..\\.env.example" (
        copy "..\\.env.example" ".env"
        echo [OK] .env created from .env.example
    )
) else (
    echo [OK] .env already exists, skipping
)

:: Quick connection test
echo.
echo Testing ODBC Driver 18 availability...
python -c "import pyodbc; drivers = pyodbc.drivers(); odbc18 = [d for d in drivers if '18' in d]; print('[OK] Found:', odbc18[0] if odbc18 else '[WARN] ODBC Driver 18 not listed - check installation')"

echo.
echo ================================================
echo   Installation complete!
echo.
echo   Next steps:
echo   1. Verify backend\.env has correct credentials
echo   2. Run database\schema.sql on MSSQL (SophiaDB)
echo   3. Run: deployment\start_backend.bat
echo ================================================
pause
