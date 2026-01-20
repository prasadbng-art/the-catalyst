from fastapi import FastAPI
from catalyst_api.routers import baseline, health, diagnostics, simulation, persona

app = FastAPI(
    title="Catalyst API",
    version="v1",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health)
app.include_router(baseline)
app.include_router(diagnostics)
app.include_router(simulation)
app.include_router(persona)