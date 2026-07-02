import json

with open(
        "questions_raw.json",
        "r",
        encoding="utf-8"
) as f:

    questions = json.load(f)

final_questions = []

for q in questions:

    q_no = q.get(
        "questionNumber",
        q.get(
            "question_number",
            0
        )
    )

    if isinstance(
            q_no,
            str
    ):
        q_no = int(
            q_no
            .replace("Q", "")
        )

    obj = {

        "questionNumber":
            q_no,

        "questionText":
            q.get(
                "questionText",
                q.get(
                    "question_text",
                    ""
                )
            ),

        "optionA":
            q.get(
                "optionA",
                ""
            ),

        "optionB":
            q.get(
                "optionB",
                ""
            ),

        "optionC":
            q.get(
                "optionC",
                ""
            ),

        "optionD":
            q.get(
                "optionD",
                ""
            ),

        "correctAnswer":
            None,

        "subject":
            None,

        "marks":
            4,

        "negativeMarks":
            1
    }

    final_questions.append(
        obj
    )

with open(
        "questions_final.json",
        "w",
        encoding="utf-8"
) as f:

    json.dump(
        final_questions,
        f,
        indent=4,
        ensure_ascii=False
    )

print(
    f"Normalized {len(final_questions)} questions"
)