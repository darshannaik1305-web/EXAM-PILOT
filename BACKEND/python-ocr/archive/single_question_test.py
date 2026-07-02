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

img = Image.open(
    "pages/q2_test.png"
)

prompt = """
Extract exactly one JEE question.

Rules:
1. Ignore Question Id.
2. Ignore Option Id.
3. Extract complete question text.
4. Extract all options.
5. Return ONLY JSON.
6. No markdown.
7. No explanation.

Format:

{
  "questionNumber": 0,
  "questionText": "",
  "optionA": "",
  "optionB": "",
  "optionC": "",
  "optionD": ""
}
"""

response = model.generate_content(
    [prompt, img],

    generation_config={
        "temperature": 0
    }
)

text = response.text.strip()

# Remove markdown if Gemini adds it
if text.startswith("```json"):
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

try:
    question = json.loads(text)

    print(
        json.dumps(
            question,
            indent=4,
            ensure_ascii=False
        )
    )

except Exception as e:

    print("JSON ERROR")
    print(e)

    print("\nRAW RESPONSE:\n")
    print(text)