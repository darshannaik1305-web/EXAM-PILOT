from marker.converters.pdf import PdfConverter

converter = PdfConverter()

result = converter("jee.pdf")

markdown = result.markdown

with open(
        "jee_output.md",
        "w",
        encoding="utf-8"
) as f:
    f.write(markdown)

print("Markdown saved to jee_output.md")