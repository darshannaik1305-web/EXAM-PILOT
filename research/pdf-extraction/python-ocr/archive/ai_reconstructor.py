import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

raw_text = """
Let
,
be the roots of the quadratic equation

for some
.
Then

is equal to :

α, α + 2, α ∈Z
x(x + 2) + (x + 1)(x + 3)
+ (x + 2)(x + 4)
= 4n

n ∈N
n + α

0
1
2
3
"""

prompt = f"""
You are reconstructing a JEE question
extracted from PDF blocks.

Rules:

1. Restore missing mathematical expressions.
2. Merge broken lines.
3. Identify options.
4. Return ONLY JSON.

Format:

{{
 "questionText":"",
 "optionA":"",
 "optionB":"",
 "optionC":"",
 "optionD":""
}}

Text:

{raw_text}
"""

response = model.generate_content(prompt)

print(response.text)