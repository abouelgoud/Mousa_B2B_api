print("1. Importing basics")
import os
from dotenv import load_dotenv
load_dotenv()

print("2. Importing Pydantic")
from pydantic import BaseModel, Field
# from langchain_core.pydantic_v1 import BaseModel, Field # alternative

print("3. Defining ComplianceAudit")
class ComplianceAudit(BaseModel):
    provider_name: str = Field(default="", description="Name of the provider")
    location: str = Field(default="", description="Location of the provider")
    is_verified: bool = Field(default=False, description="Whether the provider is officially verified in medical registers")
    license_number: str | None = Field(default=None, description="Medical license number if found") # Python 3.10+ syntax or Optional
    audit_score: int = Field(default=0, description="Compliance score from 0 to 100")
    findings: list[str] = Field(default_factory=list, description="List of key focus points or issues found")
    summary: str = Field(default="Pending analysis", description="A professional summary of the provider's compliance status")

print("4. Importing ComplianceScraper")
try:
    from compliance_scraper import ComplianceScraper
    print("   Imported ComplianceScraper")
except Exception as e:
    print(f"   Failed to import ComplianceScraper: {e}")

print("5. Importing ChatGoogleGenerativeAI")
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("   Imported ChatGoogleGenerativeAI")
except Exception as e:
    print(f"   Failed to import ChatGoogleGenerativeAI: {e}")

print("6. Initializing ComplianceScraper")
try:
    scraper = ComplianceScraper()
    print("   Initialized ComplianceScraper")
except Exception as e:
    print(f"   Failed to init ComplianceScraper: {e}")

print("7. Initializing ChatGoogleGenerativeAI")
try:
    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")
    print("   Initialized ChatGoogleGenerativeAI")
except Exception as e:
    print(f"   Failed to init ChatGoogleGenerativeAI: {e}")

print("Done")
