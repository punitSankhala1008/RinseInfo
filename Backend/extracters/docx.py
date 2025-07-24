from docx import Document

def extract_docx_text(file):
    doc = Document(file)
    return "\n".join([para.text for para in doc.paragraphs])
