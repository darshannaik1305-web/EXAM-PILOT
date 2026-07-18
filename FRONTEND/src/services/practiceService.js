import api from "./api";

export async function uploadPractice(title, uploadType, file, config = {}, signal) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("uploadType", uploadType);
  if (config.examDurationSeconds !== undefined) formData.append("examDurationSeconds", config.examDurationSeconds);
  if (config.positiveMarks !== undefined) formData.append("positiveMarks", config.positiveMarks);
  if (config.negativeMarks !== undefined) formData.append("negativeMarks", config.negativeMarks);
  if (config.examName) formData.append("examName", config.examName);
  if (config.examStructure) formData.append("examStructure", config.examStructure);
  if (config.subject) formData.append("subject", config.subject);

  const response = await api.post("/api/practice/sessions", formData, {
    signal,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteSession(sessionId) {
  const response = await api.delete(`/api/practice/sessions/${sessionId}`);
  return response.data;
}

export async function uploadAnswerKey(sessionId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/api/practice/sessions/${sessionId}/answer-key`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getSessions(page = 0, size = 10) {
  const response = await api.get(`/api/practice/sessions?page=${page}&size=${size}`);
  return response.data;
}

export async function getSession(id) {
  const response = await api.get(`/api/practice/sessions/${id}`);
  return response.data;
}

export async function getQuestions(id) {
  const response = await api.get(`/api/practice/sessions/${id}/questions`);
  return response.data;
}

export async function getSummary(id) {
  const response = await api.get(`/api/practice/sessions/${id}/summary`);
  return response.data;
}

// Mock Test Engine Endpoints
export async function startOrResumeTest(sessionId) {
  const response = await api.post(`/api/practice/${sessionId}/test/start`);
  return response.data;
}

export async function getTestSession(testSessionId) {
  const response = await api.get(`/api/practice/test-sessions/${testSessionId}`);
  return response.data;
}

export async function getTestQuestion(testSessionId, questionNumber) {
  const response = await api.get(`/api/practice/test-sessions/${testSessionId}/questions/${questionNumber}`);
  return response.data;
}

export async function saveTestAnswer(testSessionId, questionNumber, requestBody) {
  const response = await api.post(`/api/practice/test-sessions/${testSessionId}/answers/${questionNumber}`, requestBody);
  return response.data;
}

export async function getTestPalette(testSessionId) {
  const response = await api.get(`/api/practice/test-sessions/${testSessionId}/palette`);
  return response.data;
}

export async function submitTest(testSessionId) {
  const response = await api.post(`/api/practice/test-sessions/${testSessionId}/submit`);
  return response.data;
}

export async function retakeTest(sessionId) {
  const response = await api.post(`/api/practice/${sessionId}/test/retake`);
  return response.data;
}

export async function getAttemptHistory(sessionId) {
  const response = await api.get(`/api/practice/${sessionId}/attempts`);
  return response.data;
}

export async function getReviewData(testSessionId) {
  const response = await api.get(`/api/practice/test-sessions/${testSessionId}/review`);
  return response.data;
}

