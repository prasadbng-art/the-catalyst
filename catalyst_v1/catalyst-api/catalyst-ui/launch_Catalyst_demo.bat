@echo off
title Catalyst Demo

echo.
echo ================================
echo   Launching Catalyst Demo...
echo ================================
echo.

REM Ensure script runs from its own directory
cd /d "%~dp0"

REM Kill any previous serve process using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Serve production build
npx serve -s dist -l 5000 --no-clipboard

pause
