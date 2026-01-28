from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from catalyst_api.routers import baseline, health, diagnostics, simulation, persona

app = FastAPI(
    title="Catalyst API",
    version="v1",
)
# ---- Serve Frontend UI ----

FRONTEND_DIST = os.path.join(
    os.path.dirname(__file__),
    "..",
    "catalyst-ui",
    "dist"
)

app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIST, html=True),
    name="frontend",
)

# --- CORS (REQUIRED for React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(health)
app.include_router(baseline)
app.include_router(diagnostics)
app.include_router(simulation)
app.include_router(persona)
