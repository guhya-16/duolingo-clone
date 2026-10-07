from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import Base, engine, SessionLocal
import app.models  # noqa: F401 - ensure models are registered
from app.routers import course, dev, lessons, me
from app.seed import is_db_empty, seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup
    Base.metadata.create_all(bind=engine)
    # Auto-seed only if database is empty
    with SessionLocal() as db:
        if is_db_empty(db):
            seed_database(reset=False)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
)

# CORS configuration for Next.js frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.CORS_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# backend/app/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://duolingo-clone-two-vert.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Permits all Vercel preview/production links
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, dict):
        content = dict(exc.detail)
        content["detail"] = exc.detail
        return JSONResponse(status_code=exc.status_code, content=content)
    elif isinstance(exc.detail, str):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": exc.detail},
        )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Register routers
app.include_router(course.router)
app.include_router(lessons.router)
app.include_router(me.router)
app.include_router(dev.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}