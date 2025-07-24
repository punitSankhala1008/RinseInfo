from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
import os
from extracters import pdf, docx, image
from ai.gemini_extractor import call_gemini_extractor
from utils.excel_extracter import export_json_to_excel

import re
app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app.mount("/downloads", StaticFiles(directory="downloads"), name="downloads")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/extract")
async def extract_details(file: UploadFile = File()):
    content_type = file.content_type
    contents = await file.read()  # Read ONCE

    UPLOAD_DIR = "temp_uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    temp_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(temp_path, "wb") as f:
        f.write(contents)  # Write the read contents

    if content_type == "application/pdf":
        raw_text = pdf.extract_pdf_text(temp_path)
    elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        raw_text = docx.extract_docx_text(temp_path)
    elif content_type.startswith("image/"):
        raw_text = image.extract_image_text(temp_path)
    else:
        return {"error": "Unsupported file format"}

    result_text = call_gemini_extractor(raw_text)

    cleaned_text = re.sub(r"^```json\n|```$", "", result_text.strip())


    import json
    try:
        result_json = json.loads(cleaned_text)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON from Gemini", "raw": cleaned_text}

    excel_path = export_json_to_excel(result_json)

    download_filename = os.path.basename(excel_path)
    download_url = f"/downloads/{download_filename}"

    return {
        "data": result_json,
        "download_url": download_url
    }