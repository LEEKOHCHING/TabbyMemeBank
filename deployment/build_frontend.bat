@echo off
:: TABBY MEME BANK - Frontend Build Script for IIS deployment

title TABBY MEME BANK - Frontend Build

echo ================================================
echo   TABBY MEME BANK - Frontend Build
echo ================================================

cd /d "%~dp0..\frontend"

:: Install dependencies
echo [1/3] Installing npm dependencies...
call npm install

:: Build for production
echo [2/3] Building React app for production...
call npm run build

:: Copy web.config to dist
echo [3/3] Copying IIS web.config...
copy "..\deployment\web.config" "dist\web.config" /Y

echo.
echo ================================================
echo   Build complete!
echo   Deploy contents of frontend\dist\ to IIS:
echo   - Copy dist\ contents to your IIS wwwroot folder
echo   - Ensure web.config is in the root
echo   - Enable URL Rewrite + ARR in IIS Manager
echo   - Set TABBY MEME BANK site Physical Path to dist\
echo ================================================
pause
