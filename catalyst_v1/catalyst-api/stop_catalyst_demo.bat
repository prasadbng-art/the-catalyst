@echo off
echo Stopping Catalyst backend...

taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

echo Catalyst stopped.
timeout /t 2 >nul
