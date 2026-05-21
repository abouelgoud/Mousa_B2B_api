import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
import time

class ComplianceScraper:
    def __init__(self):
        self.ddgs = DDGS()

    def search_provider(self, name: str, location: str):
        """Search for provider compliance information on the web."""
        query = f"{name} {location} compliance audit medical license verification"
        results = self.ddgs.text(query, max_results=5)
        return results

    def scrape_url(self, url: str):
        """Scrape content from a specific URL."""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                return soup.get_text(separator=' ', strip=True)[:2000] # Limit to 2000 chars
        except Exception as e:
            return f"Error scraping {url}: {str(e)}"
        return ""

if __name__ == "__main__":
    scraper = ComplianceScraper()
    print(scraper.search_provider("King Faisal Specialist Hospital", "Riyadh"))
