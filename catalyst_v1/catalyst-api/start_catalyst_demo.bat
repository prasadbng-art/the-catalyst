@echo off
echo Launching Catalyst Demo...

REM Go to FastAPI backend directory
cd /d C:\Users\prasa\catalyst_sandbox\catalyst_v1\catalyst_api

REM Start FastAPI backend (keep alive)
start "Catalyst Backend" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000"

REM Wait for backend to boot
timeout /t 3 >nul

REM Open Catalyst in browser
start http://localhost:8000
