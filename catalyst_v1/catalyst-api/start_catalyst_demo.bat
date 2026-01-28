@echo off
echo Launching Catalyst Demo...

REM Go to backend directory (adjust if needed)
cd /d C:\Users\prasa\catalyst_sandbox\catalyst_v1\catalyst-api

REM Start backend using python module
start "Catalyst Backend" cmd /k "python -m uvicorn app:app --host 127.0.0.1 --port 8000"

REM Wait for server to boot
timeout /t 3 >nul

REM Open browser
start http://localhost:8000
