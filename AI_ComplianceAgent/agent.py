import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from compliance_scraper import ComplianceScraper
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

class ComplianceAudit(BaseModel):
    provider_name: str = Field(default="", description="Name of the provider")
    location: str = Field(default="", description="Location of the provider")
    is_verified: bool = Field(default=False, description="Whether the provider is officially verified in medical registers")
    license_number: Optional[str] = Field(default=None, description="Medical license number if found")
    audit_score: int = Field(default=0, description="Compliance score from 0 to 100")
    findings: List[str] = Field(default_factory=list, description="List of key focus points or issues found")
    summary: str = Field(default="Pending analysis", description="A professional summary of the provider's compliance status")

class ComplianceAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")
        self.scraper = ComplianceScraper()

    def run_audit(self, name: str, location: str) -> ComplianceAudit:
        """Runs a full compliance audit for a given provider."""
        print(f"[*] Starting audit for {name} in {location}...")
        
        # 1. Search for data
        search_results = self.scraper.search_provider(name, location)
        
        # 2. Extract content from results
        scraped_data = []
        for result in search_results:
            content = self.scraper.scrape_url(result['href'])
            scraped_data.append(f"Source: {result['title']}\nContent: {content}\n")

        # 3. Analyze with LLM
        context = "\n---\n".join(scraped_data)
        
        prompt = ChatPromptTemplate.from_template("""
        You are a Medical Compliance Audit Specialist. 
        Analyze the following web search data to determine the compliance status of:
        Provider Name: {name}
        Location: {location}

        Web Data Context:
        {context}

        Provide a structured audit report based on the clinical and regulatory findings.
        Be objective and cite license details if found.
        """)

        chain = prompt | self.llm.with_structured_output(ComplianceAudit)
        
        audit_report = chain.invoke({
            "name": name,
            "location": location,
            "context": context
        })
        
        return audit_report

if __name__ == "__main__":
    agent = ComplianceAgent()
    # Example usage (requires API key in .env)
    # report = agent.run_audit("King Faisal Specialist Hospital", "Riyadh")
    # print(report.json())
