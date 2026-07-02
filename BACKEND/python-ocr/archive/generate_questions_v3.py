import fitz
import re
import json

pdf = fitz.open("../jee.pdf")

questions = []

for page in pdf:

    blocks = page.get_text("blocks")

    q_blocks = []
    answer_blocks = []

    # Find Questions and Answer Keys
    for block in blocks:

        x0, y0, x1, y1, text = block[:5]

        text = text.strip()

        if re.match(r"Q\d+\.", text):
            q_blocks.append((text, int(y0)))

        if "MathonGo Answer Key" in text:
            answer_blocks.append((text, int(y0)))

    # Process each question
    for idx in range(min(len(q_blocks), len(answer_blocks))):

        q_text, q_start = q_blocks[idx]
        answer_text, q_end = answer_blocks[idx]

        region_blocks = []

        options = []
        answer = None

        for block in blocks:

            x0, y0, x1, y1, text = block[:5]

            text = text.strip()

            if not text:
                continue

            y = int(y0)

            if y < q_start or y > q_end:
                continue

            # Answer Key
            if "MathonGo Answer Key" in text:

                mcq = re.search(r"\((\d)\)", text)

                if mcq:

                    answer_map = {
                        "1": "A",
                        "2": "B",
                        "3": "C",
                        "4": "D"
                    }

                    answer = answer_map[
                        mcq.group(1)
                    ]

                else:

                    integer_answer = re.search(
                        r"MathonGo Answer Key\s*:\s*(\d+)",
                        text
                    )

                    if integer_answer:
                        answer = integer_answer.group(1)

                continue

            region_blocks.append(
                (int(y0), int(x0), text)
            )

        # Sort blocks by position
        region_blocks.sort(
            key=lambda b: (b[0], b[1])
        )

        collected_text = []

        for _, _, txt in region_blocks:
            collected_text.append(txt)

        whole_text = "\n".join(collected_text)

        # Recover options from text
        option_match = re.search(
            r"\(1\)(.*?)\(2\)(.*?)\(3\)(.*?)\(4\)(.*)",
            whole_text,
            re.S
        )

        if option_match:

            options = [

                option_match.group(1).strip(),

                option_match.group(2).strip(),

                option_match.group(3).strip(),

                option_match.group(4).strip()
            ]

        question_number = int(
            re.findall(r"\d+", q_text)[0]
        )

        # Subject Mapping
        if question_number <= 25:
            subject = "Mathematics"

        elif question_number <= 50:
            subject = "Physics"

        else:
            subject = "Chemistry"

        question_obj = {

            "questionNumber": question_number,

            "questionText": whole_text,

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
        "questions_v3.json",
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