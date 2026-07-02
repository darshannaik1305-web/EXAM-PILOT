import os
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

img1 = Image.open("pages/page_1.png")
img2 = Image.open("pages/page_2.png")
img3 = Image.open("pages/page_3.png")

prompt = """
These are consecutive pages from a JEE paper.

IMPORTANT:
- Questions may continue across pages.
- Use 'Question Number :' as the boundary.
- Ignore Question Id.
- Ignore Option Id.
- Extract complete questions.
- Extract complete options.

Return ONLY JSON.

Extract Questions 1 to 4.
"""

response = model.generate_content(
    [prompt, img1, img2, img3],
    generation_config={
        "temperature": 0
    }
)

print(response.text)