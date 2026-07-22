from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import uvicorn
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database.connection import connect_to_mongo, close_mongo_connection
from backend.database.redis_client import connect_to_redis, close_redis_connection

from backend.routes.auth_routes import router as auth_router
from backend.routes.dashboard_routes import router as dashboard_router
from backend.routes.alert_routes import router as alert_router
from backend.routes.log_routes import router as log_router
from backend.routes.incident_routes import router as incident_router
from backend.routes.threat_intel_routes import router as threat_intel_router
from backend.routes.report_routes import router as report_router
from backend.routes.ai_assistant_routes import router as ai_assistant_router
from backend.routes.soar_routes import router as soar_router
from backend.routes.websocket_routes import router as websocket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle events."""
    logger.info("Starting up SentinelAI backend services...")
    await connect_to_mongo()
    await connect_to_redis()
    yield
    logger.info("Shutting down SentinelAI backend services...")
    await close_mongo_connection()
    await close_redis_connection()

app = FastAPI(
    title=settings.APP_NAME,
    description="SentinelAI AI-Powered SOC Dashboard Backend API",
    version=settings.VERSION,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root():
    """Friendly root endpoint for backend server."""
    return """
    <html>
        <head>
            <title>SentinelAI Backend API</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; padding: 3rem; text-align: center; }
                h1 { color: #22d3ee; }
                a { color: #818cf8; text-decoration: none; font-weight: bold; }
                .card { background: #1e293b; padding: 2rem; border-radius: 1rem; display: inline-block; border: 1px solid #334155; margin-top: 1rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🛡️ SentinelAI Backend Service Online</h1>
                <p>FastAPI REST & WebSocket Server is Running.</p>
                <p>👉 Access Dashboard UI: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
                <p>👉 Interactive API Swagger Docs: <a href="/docs">http://localhost:8000/docs</a></p>
            </div>
        </body>
    </html>
    """

# Include API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(alert_router, prefix=api_v1_prefix)
app.include_router(log_router, prefix=api_v1_prefix)
app.include_router(incident_router, prefix=api_v1_prefix)
app.include_router(threat_intel_router, prefix=api_v1_prefix)
app.include_router(report_router, prefix=api_v1_prefix)
app.include_router(ai_assistant_router, prefix=api_v1_prefix)
app.include_router(soar_router, prefix=api_v1_prefix)
app.include_router(websocket_router)

@app.get("/api/v1/health")
async def health_check():
    """System health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.VERSION}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
