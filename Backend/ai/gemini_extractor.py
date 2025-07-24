# import requests
# import os

# API_KEY = "sk-5acfedcdac464190b273885b093c60a2"  # Store securely in .env for production

# def call_deepseek_extractor(text):
#     prompt = f"""
# You are an AI assistant that extracts structured data from documents.
# Extract the following fields from this text and return a JSON:
# - Name
# - Email
# - Phone Number
# - Date
# - Address
# - Invoice Number
# - Total Amount
# - Organization

# Return null if any field is not found.

# Text:
# {text}
# """

#     headers = {
#         "Authorization": f"Bearer {API_KEY}",
#         "Content-Type": "application/json"
#     }

#     data = {
#         "model": "deepseek-chat",
#         "messages": [{"role": "user", "content": prompt}],
#         "temperature": 0.3
#     }

#     url = "https://api.deepseek.com/v1/chat/completions"
#     response = requests.post(url, headers=headers, json=data)
#     resp_json = response.json()
#     if "choices" in resp_json:
#         return resp_json["choices"][0]["message"]["content"]
#     else:
#         # Return error details for debugging
#         return f"API Error: {resp_json.get('error', resp_json)}"

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Best practice: Load from environment variable or .env
load_dotenv()
API_KEY = os.getenv("AIzaSyAS_F9M6dq3oYifmfj0fG72bOnUdxw0Tt0")

genai.configure(api_key=API_KEY)

def call_gemini_extractor(text):
    prompt = f"""
You are an AI assistant that extracts structured data from documents.
Extract the following fields from this text and return a JSON object:
- Name
- Email
- Phone Number
- Date
- Address
- Organization
- and All Relevent Informations. 

Return null for fields not found.

Text:
{text}
"""
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")  # Gemini 2.0 Flash maps to 1.5 Flash API
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini API Error: {e}"
