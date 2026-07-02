from paddleocr import PaddleOCR
from pdf2image import convert_from_path

ocr = PaddleOCR(use_angle_cls=True, lang='en')

images = convert_from_path("jee.pdf")

full_text = ""

for image in images:

    image.save("temp.jpg")

    result = ocr.predict("temp.jpg")

    for line in result:

        for item in line:

            full_text += item[1][0] + "\n"

with open(
        "ocr_output.txt",
        "w",
        encoding="utf-8"
) as f:

    f.write(full_text)

print("OCR Complete")