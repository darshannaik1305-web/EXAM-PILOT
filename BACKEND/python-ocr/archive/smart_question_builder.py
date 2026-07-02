import fitz
import re

pdf = fitz.open("../jee.pdf")

page = pdf[0]

blocks = page.get_text("blocks")

for block in blocks:

    x0, y0, x1, y1, text = block[:5]

    text = text.strip()

    if not text:
        continue

    print("\n")
    print("=" * 50)

    print(
        f"x={int(x0)} y={int(y0)}"
    )

    print(text[:300])