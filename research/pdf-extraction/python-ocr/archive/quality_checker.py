def question_is_incomplete(question):

    if question["optionA"] is None:
        return True

    if question["optionB"] is None:
        return True

    if question["optionC"] is None:
        return True

    if question["optionD"] is None:
        return True

    return False