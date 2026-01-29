@echo off
echo Starting Catalyst backend...

REM Move to backend root
cd /d C:\Users\prasa\catalyst_sandbox\catalyst_v1\catalyst-api

REM Activate virtual environment
call .venv\Scripts\activate

REM Start FastAPI (no reload, no dev flags)
python -m uvicorn catalyst_api.main:app --host 127.0.0.1 --port 8000
