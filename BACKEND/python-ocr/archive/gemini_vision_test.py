import os
import json
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

image = Image.open("pages/page_1.png")

prompt = """
Extract all JEE questions visible in this image.

Rules:
1. Ignore Question Id values.
2. Ignore Option Id values like 6911211, 6911212.
3. Keep only actual option values.
4. Return ONLY valid JSON.
5. No markdown.
6. No explanation.

Format:

[
  {
    "questionNumber": 1,
    "questionText": "",
    "optionA": "",
    "optionB": "",
    "optionC": "",
    "optionD": ""
  }
]
"""

response = model.generate_content(
    [prompt, image]
)

print(response.text)