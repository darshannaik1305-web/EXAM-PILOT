import fitz

def is_text_pdf(pdf_path):

    pdf = fitz.open(pdf_path)

    total_text = ""

    for page in pdf:
        total_text += page.get_text()

    pdf.close()

    return len(total_text.strip()) > 100


if __name__ == "__main__":

    pdf_path = "../jee.pdf"

    if is_text_pdf(pdf_path):
        print("TEXT PDF")
    else:
        print("IMAGE PDF")