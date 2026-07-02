import fitz
import re

pdf = fitz.open("../jee.pdf")

text = ""

for page in pdf:
    text += page.get_text()

questions = re.split(r'Q\d+\.', text)

print("Questions Found:", len(questions) - 1)

for i, q in enumerate(questions[1:6], start=1):
    print("\n===================")
    print("QUESTION", i)
    print("===================")

    print(q[:500])