import pytesseract
from PIL import Image

def extract_image_text(file):
    image = Image.open(file)
    return pytesseract.image_to_string(image)
