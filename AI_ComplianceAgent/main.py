import sys
from agent import ComplianceAgent
import json

def main():
    if len(sys.argv) < 3:
        print("Usage: python main.py <provider_name> <location>")
        sys.exit(1)

    name = sys.argv[1]
    location = sys.argv[2]

    agent = ComplianceAgent()
    try:
        report = agent.run_audit(name, location)
        
        print("\n" + "="*50)
        print(f"COMPLIANCE AUDIT REPORT: {report.provider_name}")
        print("="*50)
        print(f"Status: {'VERIFIED [✓]' if report.is_verified else 'UNCERTAIN [?]'}")
        print(f"Score: {report.audit_score}/100")
        print(f"License: {report.license_number or 'Not Found'}")
        print(f"Location: {report.location}")
        print("-"*50)
        print("Findings:")
        for finding in report.findings:
            print(f"- {finding}")
        print("-"*50)
        print("Summary:")
        print(report.summary)
        print("="*50)

    except Exception as e:
        print(f"Error during audit: {str(e)}")

if __name__ == "__main__":
    main()
