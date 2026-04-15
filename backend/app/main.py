"""TABBY MEME BANK - FastAPI Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import asyncio
import logging

from app.config import get_settings
from app.database import check_connection, Base, engine
from app.api import fund, lending, sophia
from app.services.sophia_agent import sophia_market_scan
from app.database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()
scheduler = AsyncIOScheduler()


async def periodic_market_scan():
    """Periodic task: Sophia scans the market every 2 minutes."""
    db = SessionLocal()
    try:
        await sophia_market_scan(db)
    except Exception as e:
        logger.error(f"Periodic market scan error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database init error: {e}")

    # Check DB connection
    if check_connection():
        logger.info("Database connection: OK")
    else:
        logger.warning("Database connection: FAILED - running without DB")

    # Start background scheduler
    scheduler.add_job(
        periodic_market_scan,
        IntervalTrigger(minutes=2),
        id="market_scan",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Sophia market scanner started (every 2 minutes)")

    yield

    # Shutdown
    scheduler.shutdown()
    logger.info("Scheduler stopped")


app = FastAPI(
    title="TABBY MEME BANK API",
    description="BSC Meme Token Investment & P2P Lending Platform powered by AI Sophia",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(fund.router)
app.include_router(lending.router)
app.include_router(sophia.router)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    db_ok = check_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "TABBY MEME BANK API",
        "version": "1.0.0",
        "database": "connected" if db_ok else "disconnected",
    }


@app.get("/api/config")
def get_public_config():
    """Get public configuration for frontend."""
    return {
        "tabby_contract_address": settings.tabby_contract_address,
        "sophia_bsc_address": settings.sophia_bsc_address,
        "bsc_chain_id": 56,
        "bsc_chain_name": "BNB Smart Chain",
        "bsc_rpc_url": "https://bsc-dataseed.binance.org/",  # Public RPC for frontend
    }
