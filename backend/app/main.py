from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed_data import seed_database
from app.routers import (
    auth_router,
    dashboard_router,
    logs_router,
    alerts_router,
    incidents_router,
    phishing_router,
    ai_router,
    devices_router,
    policies_router,
    users_router,
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ThreatLens AI – AI-Powered Login Anomaly Detection and Security Incident Assistant for Small Organizations and Colleges.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon setup: allow Vite dev server and browsers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to auto-seed database with realistic records
@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"[!] Seed database notice: {e}")

# Register all API routers
app.include_router(auth_router.router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router.router, prefix=settings.API_PREFIX)
app.include_router(logs_router.router, prefix=settings.API_PREFIX)
app.include_router(alerts_router.router, prefix=settings.API_PREFIX)
app.include_router(incidents_router.router, prefix=settings.API_PREFIX)
app.include_router(phishing_router.router, prefix=settings.API_PREFIX)
app.include_router(ai_router.router, prefix=settings.API_PREFIX)
app.include_router(devices_router.router, prefix=settings.API_PREFIX)
app.include_router(policies_router.router, prefix=settings.API_PREFIX)
app.include_router(users_router.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": "ThreatLens AI API",
        "status": "Online",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "ai_status": "active",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY)
    }
