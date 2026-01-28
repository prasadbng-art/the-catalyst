@echo off
echo Launching Catalyst Demo...

REM Go to backend root
cd /d C:\Users\prasa\catalyst_sandbox\catalyst_v1\catalyst-api

REM Activate virtual environment
call .venv\Scripts\activate

REM Start backend (if not already running)
start "Catalyst Backend" cmd /k "python -m uvicorn catalyst_api.main:app --host 127.0.0.1 --port 8000"

echo.
echo Catalyst backend is running.
echo Open http://localhost:8000 in your browser.
echo.
