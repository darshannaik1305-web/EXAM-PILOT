import api from "./api";

export async function getStudentAnalytics() {
  const response = await api.get("/api/analytics");
  return response.data;
}
