import fitz

def detect_pdf_type(pdf_path):

    pdf = fitz.open(pdf_path)

    first_page = pdf[0].get_text()

    if "MathonGo Answer Key" in first_page:
        return "MATHONGO"

    if "National Testing Agency" in first_page:
        return "NTA"

    if "ALLEN" in first_page.upper():
        return "ALLEN"

    return "UNKNOWN"


print(detect_pdf_type("../jee.pdf"))