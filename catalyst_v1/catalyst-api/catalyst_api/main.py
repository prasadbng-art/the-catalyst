from fastapi import FastAPI
from catalyst_api.routers import baseline

app = FastAPI(title="Catalyst API v1")

app.include_router(baseline.router)

@app.get("/")
def health():
    return {"status": "ok"}
