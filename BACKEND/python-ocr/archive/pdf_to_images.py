from pdf2image import convert_from_path
import os

PDF_FILE = "../jee.pdf"

OUTPUT_DIR = "pages"

POPPLER_PATH = r"E:\poppler\poppler-26.02.0\Library\bin"   # <-- CHANGE THIS

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

pages = convert_from_path(
    PDF_FILE,
    dpi=300,
    poppler_path=POPPLER_PATH
)

for i, page in enumerate(
        pages,
        start=1
):
    page.save(
        f"{OUTPUT_DIR}/page_{i}.png",
        "PNG"
    )

print(
    f"Saved {len(pages)} pages"
)