from pdf2image import convert_from_path
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

pages = convert_from_path(
    "jee.pdf",
    dpi=300,
    poppler_path=r"E:\poppler\poppler-26.02.0\Library\bin"
)

print("Total Pages:", len(pages))

text = pytesseract.image_to_string(
    pages[0],
    config="--psm 6"
)

print("\n===== OCR OUTPUT =====\n")
print(text[:5000])