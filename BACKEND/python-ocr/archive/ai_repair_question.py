import json
import google.generativeai as genai

# API KEY
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def repair_question(question):

    prompt = f"""
You are an expert JEE Question Parser.

Your job:

1. Reconstruct the question text.
2. Extract optionA optionB optionC optionD.
3. Preserve formulas and symbols.
4. Return ONLY JSON.

Question:

{json.dumps(question, ensure_ascii=False)}

Output Format:

{{
  "questionText":"",
  "optionA":"",
  "optionB":"",
  "optionC":"",
  "optionD":""
}}
"""

    response = model.generate_content(prompt)

    return response.text


# TEST

with open(
        "questions_v3.json",
        "r",
        encoding="utf-8"
) as f:

    questions = json.load(f)

print(
    repair_question(
        questions[0]
    )
)