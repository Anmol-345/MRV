from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
import yaml
from pathlib import Path

app = FastAPI(
    title="BluToken MRV Worker",
    version="0.1.0",
    description="Satellite observation, carbon calculations, and MRV bundle processing"
)

# Load demo parameters
PARAMS_PATH = Path(__file__).parent / "demo_params.yaml"

class MrvJobRequest(BaseModel):
    project_id: int
    period_start: int
    period_end: int

class MrvJobResult(BaseModel):
    job_id: str
    status: str
    progress: int
    bundle_cid: Optional[str] = None
    sha256: Optional[str] = None
    estimated_milli_tco2e: Optional[int] = None

# In-memory jobs for skeleton
JOBS_DB: dict[str, MrvJobResult] = {}

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "mrv-worker",
        "version": "0.1.0",
        "mode": "demo"
    }

@app.post("/jobs", response_model=MrvJobResult)
def create_job(request: MrvJobRequest):
    job_id = str(uuid.uuid4())
    job = MrvJobResult(
        job_id=job_id,
        status="pending",
        progress=0
    )
    JOBS_DB[job_id] = job
    return job

@app.get("/jobs/{job_id}", response_model=MrvJobResult)
def get_job(job_id: str):
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS_DB[job_id]

@app.get("/observations")
def get_observations(project_id: Optional[int] = None):
    return {
        "project_id": project_id,
        "observations": []
    }
