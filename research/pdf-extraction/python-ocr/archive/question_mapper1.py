import fitz

pdf = fitz.open("../jee.pdf")

page = pdf[0]

blocks = page.get_text("blocks")

for i, block in enumerate(blocks):

    x0, y0, x1, y1, text = block[:5]

    text = text.strip()

    if "MathonGo Answer Key" in text:
        print(
            f"BLOCK {i}  y={int(y0)}"
        )