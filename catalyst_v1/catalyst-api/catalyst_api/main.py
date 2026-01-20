from fastapi import FastAPI

from catalyst_api.routers import baseline, health

app = FastAPI(
    title="Catalyst API",
    version="v1",
)

app.include_router(health)
app.include_router(baseline)
