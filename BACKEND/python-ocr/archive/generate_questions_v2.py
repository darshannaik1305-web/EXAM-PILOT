import fitz
import re
import json

pdf = fitz.open("../jee.pdf")

questions = []

for page in pdf:

    blocks = page.get_text("blocks")

    q_blocks = []
    answer_blocks = []

    # Find questions and answer keys
    for block in blocks:

        x0, y0, x1, y1, text = block[:5]

        text = text.strip()

        if re.match(r"Q\d+\.", text):
            q_blocks.append((text, int(y0)))

        if "MathonGo Answer Key" in text:
            answer_blocks.append((text, int(y0)))

    # Match Q with Answer Key
    for idx in range(min(len(q_blocks), len(answer_blocks))):

        q_text, q_start = q_blocks[idx]
        answer_text, q_end = answer_blocks[idx]

        collected_blocks = []

        options = []

        answer = None

        for block in blocks:

            x0, y0, x1, y1, text = block[:5]

            y = int(y0)

            if not (q_start <= y <= q_end):
                continue

            text = text.strip()

            if not text:
                continue

            # Skip answer block
            if "MathonGo Answer Key" in text:

                m = re.search(r"\((\d)\)", text)

                if m:

                    option_map = {
                        "1": "A",
                        "2": "B",
                        "3": "C",
                        "4": "D"
                    }

                    answer = option_map[m.group(1)]

                continue

            # Option block
            lines = text.splitlines()

            if len(lines) == 4:

                numeric = True

                for l in lines:

                    if not l.strip():
                        numeric = False

                if numeric:

                    options = lines
                    continue

            collected_blocks.append(text)

        question_number = int(
            re.findall(r"\d+", q_text)[0]
        )

        subject = (
            "Mathematics"
            if question_number <= 25
            else "Physics"
            if question_number <= 50
            else "Chemistry"
        )

        question_obj = {

            "questionNumber": question_number,

            "questionText":
                "\n".join(collected_blocks),

            "optionA":
                options[0] if len(options) > 0 else None,

            "optionB":
                options[1] if len(options) > 1 else None,

            "optionC":
                options[2] if len(options) > 2 else None,

            "optionD":
                options[3] if len(options) > 3 else None,

            "correctAnswer": answer,

            "marks": 4,

            "negativeMarks": 1,

            "subject": subject,

            "topic": None,

            "difficultyLevel": None,

            "exam": None
        }

        questions.append(question_obj)

with open(
        "questions_v2.json",
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
    f"Generated {len(questions)} questions"
)