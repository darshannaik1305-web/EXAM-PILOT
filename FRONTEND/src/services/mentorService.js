import api from "./api";

export async function sendMentorMessage(messages) {
  const response = await api.post("/api/mentor/chat", messages);
  return response.data;
}
