import fitz

pdf = fitz.open("../jee.pdf")

page = pdf[0]

blocks = page.get_text("blocks")

q1_start = 86
q1_end = 203

print("\nQ1 BLOCKS\n")

for i, block in enumerate(blocks):

    x0, y0, x1, y1, text = block[:5]

    y = int(y0)

    if q1_start <= y <= q1_end:

        print("=" * 50)
        print(f"BLOCK {i}")
        print(f"y = {y}")
        print(text.strip())