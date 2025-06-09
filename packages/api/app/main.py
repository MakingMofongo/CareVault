from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.api import auth, users, appointments, prescriptions, ai, share


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up CareVault API...")
    init_db()
    yield
    # Shutdown
    print("Shutting down CareVault API...")


app = FastAPI(
    title="CareVault API",
    description="API for streamlined clinical workflow with AI-powered decision support",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(share.router, prefix="/api/share", tags=["Share"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to CareVault API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "carevault-api"}