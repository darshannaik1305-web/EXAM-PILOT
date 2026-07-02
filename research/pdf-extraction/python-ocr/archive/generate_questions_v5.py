import fitz
import re
import json

pdf = fitz.open("../jee.pdf")

questions = []

for page in pdf:

    blocks = page.get_text("blocks")

    # sort by coordinates
    blocks = sorted(
        blocks,
        key=lambda b: (int(b[1]), int(b[0]))
    )

    q_blocks = []
    answer_blocks = []

    for block in blocks:

        x0, y0, x1, y1, text = block[:5]

        text = text.strip()

        if re.match(r"Q\d+\.", text):
            q_blocks.append(
                (text, int(y0))
            )

        if "MathonGo Answer Key" in text:
            answer_blocks.append(
                (text, int(y0))
            )

    for idx in range(
            min(len(q_blocks), len(answer_blocks))
    ):

        q_text, q_start = q_blocks[idx]
        answer_text, q_end = answer_blocks[idx]

        question_number = int(
            re.findall(r"\d+", q_text)[0]
        )

        answer = None

        m = re.search(
            r"\((\d)\)",
            answer_text
        )

        if m:

            answer_map = {
                "1": "A",
                "2": "B",
                "3": "C",
                "4": "D"
            }

            answer = answer_map[
                m.group(1)
            ]

        question_parts = []
        formula_parts = []
        options = []

        for block in blocks:

            x0, y0, x1, y1, text = block[:5]

            text = text.strip()

            if not text:
                continue

            y = int(y0)

            if y < q_start or y > q_end:
                continue

            # skip answer key
            if "MathonGo Answer Key" in text:
                continue

            # detect option block
            lines = [
                l.strip()
                for l in text.splitlines()
                if l.strip()
            ]

            if (
                    len(lines) == 4
                    and all(
                re.match(
                    r"^-?\d+$",
                    x
                )
                for x in lines
            )
            ):

                options = lines
                continue

            # formula block
            if any(
                    symbol in text
                    for symbol in [
                        "α",
                        "β",
                        "√",
                        "∈",
                        "=",
                        "+",
                        "−",
                        "i"
                    ]
            ):

                formula_parts.append(
                    text
                )

                continue

            # normal question block
            question_parts.append(
                text
            )

        full_question = "\n".join(
            question_parts
        )

        if formula_parts:

            full_question += "\n\n"

            full_question += "\n".join(
                formula_parts
            )

        if question_number == 1:

            print("\n")
            print("=" * 60)
            print("Q1 PREVIEW")
            print("=" * 60)

            print(full_question)

            print("\nOPTIONS")
            print(options)

            print("\nANSWER")
            print(answer)

        subject = (
            "Mathematics"
            if question_number <= 25
            else "Physics"
            if question_number <= 50
            else "Chemistry"
        )

        questions.append({

            "questionNumber":
                question_number,

            "questionText":
                full_question,

            "optionA":
                options[0]
                if len(options) > 0
                else None,

            "optionB":
                options[1]
                if len(options) > 1
                else None,

            "optionC":
                options[2]
                if len(options) > 2
                else None,

            "optionD":
                options[3]
                if len(options) > 3
                else None,

            "correctAnswer":
                answer,

            "subject":
                subject,

            "marks": 4,

            "negativeMarks": 1
        })

with open(
        "questions_v5.json",
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
    f"\nGenerated {len(questions)} questions"
)