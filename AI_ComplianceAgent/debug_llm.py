from dotenv import load_dotenv
load_dotenv()
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("Imported ChatGoogleGenerativeAI")
    llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")
    print("Initialized ChatGoogleGenerativeAI")
except Exception as e:
    print(f"Failed: {e}")
