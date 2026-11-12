from contextlib import asynccontextmanager
import platform
import sys
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.routes.chat import router as chat_router
from app.routes.memories import router as memories_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize SQLite tables and ensure database dir exists
    init_db()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="JARVIS macOS AI Assistant Backend",
    lifespan=lifespan,
)

# Enable CORS for the React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

# Register routers
app.include_router(chat_router)
app.include_router(memories_router)

@app.get("/")
def read_root():
    return {
        "name": settings.app_name,
        "status": "online",
        "version": settings.version,
        "message": "JARVIS core backend is active and ready.",
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 2),
    }

@app.get("/api/status")
def system_status():
    from app.db.repositories import list_memories, list_conversations
    import psutil
    try:
        mem_count = len(list_memories())
        conv_count = len(list_conversations())
    except Exception:
        mem_count = 0
        conv_count = 0

    try:
        cpu_pct = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        ram_pct = mem.percent
    except Exception:
        cpu_pct = 0.0
        ram_pct = 0.0

    return {
        "assistant_name": "JARVIS",
        "status": "online",
        "platform": platform.system(),
        "platform_release": platform.release(),
        "machine": platform.machine(),
        "python_version": sys.version.split()[0],
        "node": "ready",
        "phase": 2,
        "database": "sqlite_ready",
        "memories_count": mem_count,
        "conversations_count": conv_count,
        "cpu_percent": cpu_pct,
        "ram_percent": ram_pct,
    }

@app.get("/api/system/metrics")
def system_metrics():
    import psutil
    try:
        cpu_percent = psutil.cpu_percent(interval=None)
        cpu_count = psutil.cpu_count(logical=True)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        net = psutil.net_io_counters()

        # Real active processes safely filtered
        processes = []
        try:
            for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    info = p.info
                    if info and info.get('name'):
                        processes.append({
                            "pid": info['pid'],
                            "name": info['name'],
                            "cpu_percent": round(info.get('cpu_percent') or 0.0, 1),
                            "memory_percent": round(info.get('memory_percent') or 0.0, 1),
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
            processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
            top_procs = processes[:6]
        except Exception:
            top_procs = []

        return {
            "cpu": {
                "percent": cpu_percent,
                "cores": cpu_count or 8,
            },
            "memory": {
                "total_gb": round(mem.total / (1024 ** 3), 1),
                "used_gb": round(mem.used / (1024 ** 3), 1),
                "free_gb": round(mem.available / (1024 ** 3), 1),
                "percent": mem.percent,
            },
            "disk": {
                "total_gb": round(disk.total / (1024 ** 3), 1),
                "used_gb": round(disk.used / (1024 ** 3), 1),
                "free_gb": round(disk.free / (1024 ** 3), 1),
                "percent": disk.percent,
            },
            "network": {
                "bytes_sent_mb": round(net.bytes_sent / (1024 ** 2), 1),
                "bytes_recv_mb": round(net.bytes_recv / (1024 ** 2), 1),
            },
            "processes": top_procs,
        }
    except Exception as e:
        return {
            "cpu": {"percent": 0.0, "cores": 8},
            "memory": {"total_gb": 16.0, "used_gb": 8.0, "free_gb": 8.0, "percent": 50.0},
            "disk": {"total_gb": 512.0, "used_gb": 128.0, "free_gb": 384.0, "percent": 25.0},
            "network": {"bytes_sent_mb": 0.0, "bytes_recv_mb": 0.0},
            "processes": [],
            "error": str(e),
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

