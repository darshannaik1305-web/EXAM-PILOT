import os
import sys
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

pdf_path = sys.argv[1]
output_path = sys.argv[2]

uploaded_file = client.files.upload(
    file=pdf_path
)

prompt = """
Extract all questions from this JEE paper.

Return JSON only.

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

Rules:
- Extract all questions.
- Extract complete options.
- Ignore Question IDs.
- Ignore metadata.
- Return valid JSON only.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        uploaded_file,
        prompt
    ]
)

text = response.text.strip()

if text.startswith("```json"):
    text = text.replace("```json", "")

if text.endswith("```"):
    text = text.replace("```", "")

questions = json.loads(text)

with open(
        output_path,
        "w",
        encoding="utf-8"
) as f:

    json.dump(
        questions,
        f,
        indent=4,
        ensure_ascii=False
    )

print(
    f"Extracted {len(questions)} questions"
)