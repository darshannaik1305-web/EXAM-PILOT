import os
import json
import time
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai

# =========================
# LOAD ENV
# =========================

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

# =========================
# MODEL
# =========================

model = genai.GenerativeModel(
    "gemini-2.0-flash"
)

# =========================
# PROMPT
# =========================

PROMPT = """
You are extracting questions from a JEE Main paper.

Questions may continue across pages.

Ignore:
- Question Id
- Option Id
- Metadata
- Instructions
- Headers
- Footers

Return ONLY valid JSON.

Schema:

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

- Extract complete question text.
- Extract complete options.
- questionNumber must be integer.
- Preserve mathematical symbols.
- If a question continues onto next page,
  combine the full question.
- For Numerical Value questions,
  leave optionA-D empty.
- Return JSON only.
"""

# =========================
# GET PAGES
# =========================

pages = sorted(
    [
        f
        for f in os.listdir("pages")
        if f.endswith(".png")
    ],
    key=lambda x: int(
        x.split("_")[1].split(".")[0]
    )
)

print(f"Found {len(pages)} pages")

# =========================
# EXTRACTION
# =========================

all_questions = []

BATCH_SIZE = 5

for i in range(
        0,
        len(pages),
        BATCH_SIZE
):

    batch = pages[
        i:i + BATCH_SIZE
    ]

    print(
        f"\nProcessing {batch}"
    )

    images = [
        Image.open(
            os.path.join(
                "pages",
                img
            )
        )
        for img in batch
    ]

    success = False

    for attempt in range(3):

        try:

            response = model.generate_content(
                [PROMPT] + images,
                generation_config={
                    "temperature": 0,
                    "response_mime_type":
                        "application/json"
                }
            )

            questions = json.loads(
                response.text
            )

            all_questions.extend(
                questions
            )

            success = True

            print(
                f"Extracted {len(questions)} questions"
            )

            break

        except Exception as e:

            print(
                f"Attempt {attempt+1} failed"
            )

            print(e)

            if "429" in str(e):

                wait_time = 60

                print(
                    f"Quota hit. Waiting {wait_time}s..."
                )

                time.sleep(wait_time)

            else:

                time.sleep(5)

    if not success:

        print(
            f"Skipping batch {batch}"
        )

# =========================
# DEDUPLICATE
# =========================

unique_questions = {}

for q in all_questions:

    try:

        qno = int(
            q["questionNumber"]
        )

        unique_questions[qno] = q

    except:
        pass

all_questions = list(
    unique_questions.values()
)

# =========================
# SORT
# =========================

all_questions.sort(
    key=lambda x: int(
        x["questionNumber"]
    )
)

# =========================
# SUBJECT MAPPING
# =========================

for q in all_questions:

    qno = int(
        q["questionNumber"]
    )

    if qno <= 25:

        q["subject"] = "Mathematics"

    elif qno <= 50:

        q["subject"] = "Physics"

    else:

        q["subject"] = "Chemistry"

# =========================
# SAVE RAW
# =========================

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

# =========================
# VALIDATION
# =========================

numbers = sorted(
    [
        int(q["questionNumber"])
        for q in all_questions
    ]
)

missing = []

for i in range(1, 76):

    if i not in numbers:

        missing.append(i)

print("\n====================")
print("FINAL REPORT")
print("====================")

print(
    f"Extracted {len(all_questions)} unique questions"
)

print(
    f"Missing Questions: {missing}"
)

if len(all_questions) == 75:

    print(
        "SUCCESS: All 75 questions extracted"
    )

else:

    print(
        "WARNING: Some questions missing"
    )