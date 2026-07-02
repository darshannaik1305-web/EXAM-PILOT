import fitz

pdf = fitz.open("../jee.pdf")

page = pdf[0]

blocks = page.get_text("blocks")

for i, b in enumerate(blocks):

    x0 = round(b[0])
    y0 = round(b[1])
    x1 = round(b[2])
    y1 = round(b[3])

    print(
        f"BLOCK {i}"
    )

    print(
        f"x={x0} y={y0}"
    )

    print(
        b[4][:200]
    )

    print("="*50)
