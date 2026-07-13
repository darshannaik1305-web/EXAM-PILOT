import api from "./api";

export async function uploadPractice(title, uploadType, file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("uploadType", uploadType);

  const response = await api.post("/api/practice/sessions", formData, {
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
