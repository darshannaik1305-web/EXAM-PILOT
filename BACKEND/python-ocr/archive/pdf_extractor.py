import fitz

pdf = fitz.open("../jee.pdf")

full_text = ""

for page_num in range(len(pdf)):
    page = pdf[page_num]
    text = page.get_text()

    print(f"\n===== PAGE {page_num + 1} =====\n")
    print(text[:1000])  # first 1000 chars

    full_text += text

print("\n=================================")
print("TOTAL CHARACTERS:", len(full_text))
print("=================================")