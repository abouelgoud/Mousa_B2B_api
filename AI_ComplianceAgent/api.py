from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import ComplianceAgent, ComplianceAudit
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI(title="B2B AI Compliance Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Initializing ComplianceAgent...")
agent = ComplianceAgent()

class AuditRequest(BaseModel):
    name: str
    location: str

@app.get("/")
async def root():
    return {"message": "B2B AI Compliance Agent is active", "endpoints": ["/audit", "/health"]}

@app.post("/audit")
async def run_audit(request: AuditRequest):
    logger.info(f"Received audit request for: {request.name} in {request.location}")
    try:
        report = agent.run_audit(request.name, request.location)
        return report
    except Exception as e:
        logger.error(f"Audit failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "online"}

if __name__ == "__main__":
    logger.info("Starting server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
