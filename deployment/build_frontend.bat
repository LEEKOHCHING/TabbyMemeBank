@echo off
:: TABBY MEME BANK - Frontend Build Script for IIS deployment

title TABBY MEME BANK - Frontend Build

echo ================================================
echo   TABBY MEME BANK - Frontend Build
echo ================================================

:: Go to frontend folder (relative to this script's location)
cd /d "%~dp0..\frontend"

:: Install dependencies
echo [1/3] Installing npm dependencies...
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed & pause & exit /b 1 )

:: Build for production
echo [2/3] Building React app for production...
call npm run build
if errorlevel 1 ( echo [ERROR] Build failed & pause & exit /b 1 )

:: Copy web.config into the dist folder
echo [3/3] Copying IIS web.config into dist\...
if not exist "dist" mkdir dist
copy /Y "%~dp0web.config" "dist\web.config"
if errorlevel 1 ( echo [WARN] Could not copy web.config & ) else ( echo [OK] web.config copied )

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
