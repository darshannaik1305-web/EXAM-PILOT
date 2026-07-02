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

all_questions = []

pages = [
    "page_1.png",
    "page_2.png"
]

for page_file in pages:

    if not page_file.endswith(".png"):
        continue

    print(f"Processing {page_file}")

    image = Image.open(
        os.path.join("pages", page_file)
    )

    prompt = """
Read the page carefully.

Extract every question visible.

IMPORTANT:

1. Use the exact Question Number shown in the image.
2. Never invent question numbers.
3. Ignore Question Id.
4. Ignore Option Id.
5. Extract all options completely.
6. Return ONLY JSON.

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

    try:

        response = model.generate_content(
            [prompt, image]
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "")
            text = text.replace("```", "").strip()

        questions = json.loads(text)

        all_questions.extend(
            questions
        )

    except Exception as e:

        print(
            f"Failed on {page_file}:",
            e
        )

with open(
        "questions_raw.json",
        "w",
        encoding="utf-8"
) as f:

    json.dump(
        all_questions,
        f,
        indent=4,
        ensure_ascii=False
    )

print(
    f"\nExtracted {len(all_questions)} questions"
)