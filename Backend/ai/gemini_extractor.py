import os
import google.generativeai as genai
from dotenv import load_dotenv

# Best practice: Load from environment variable or .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=API_KEY)

def call_gemini_extractor(text):
    # Truncate text if it's too long to prevent API limits
    max_text_length = 100000  # Adjust based on Gemini's limits
    if len(text) > max_text_length:
        text = text[:max_text_length] + "... [Text truncated due to length]"
    
    prompt = f"""
You are an AI assistant that extracts structured data from documents.
Extract the relevant details and table fields from this text and return a valid, complete JSON object.

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid JSON - no markdown formatting, no code blocks
2. Ensure the JSON is complete and properly closed
3. If the document is large, summarize key information rather than including everything
4. Include document structure with sections and subsections
5. Extract all tables with proper headers and data
6. Include metadata like document type, dates, etc.

Text:
{text}
"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Configure generation settings to prevent truncation
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=1000000,  # Increase output limit
            temperature=0.1,  # Lower temperature for more consistent output
        )
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        return response.text
    except Exception as e:
        return f"Gemini API Error: {e}"
