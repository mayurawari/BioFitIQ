from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

Models = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
]

def llm_with_fallback():
    
    for model in Models:
        try:
            llm = ChatGoogleGenerativeAI(model = model, temperature = 0.5)
            
            ping = llm.invoke("Hello")
            
            if ping:
                print(f"Using model: {model}")
                
            return llm
            
        except Exception as e:
            print(f"Model {model} failed with error: {e}")
            continue
        
    raise RuntimeError("All fallback models failed!")


llm = llm_with_fallback()

