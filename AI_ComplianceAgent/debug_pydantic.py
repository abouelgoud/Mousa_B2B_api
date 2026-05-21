from pydantic.v1 import BaseModel, Field
from typing import List, Optional

try:
    print("Attempting to define ComplianceAudit using pydantic.v1...")
    class ComplianceAudit(BaseModel):
        provider_name: str = Field(..., description="Name of the provider")
        location: str = Field(..., description="Location of the provider")
        is_verified: bool = Field(..., description="Whether the provider is officially verified in medical registers")
        license_number: Optional[str] = Field(..., description="Medical license number if found")
        audit_score: int = Field(..., description="Compliance score from 0 to 100")
        findings: List[str] = Field(..., description="List of key focus points or issues found")
        summary: str = Field(..., description="A professional summary of the provider's compliance status")
    print("ComplianceAudit class defined successfully")
except Exception as e:
    print(f"Failed to define ComplianceAudit: {e}")
