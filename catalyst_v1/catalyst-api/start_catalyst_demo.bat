@echo off
echo Launching Catalyst Demo...

REM Go to backend root (NOT catalyst_api)
cd /d C:\Users\prasa\catalyst_sandbox\catalyst_v1\catalyst-api

REM Activate virtual environment
call .venv\Scripts\activate

REM Start FastAPI backend (correct module path)
start "Catalyst Backend" cmd /k "python -m uvicorn catalyst_api.main:app --host 127.0.0.1 --port 8000"

REM Wait for server to boot
timeout /t 3 >nul

REM Open browser
start ""/B "http://localhost:8000"
	