import api from "./api";

export async function getStudentAnalytics() {
  const response = await api.get("/api/analytics");
  return response.data;
}

export async function getDashboardStats() {
  const response = await api.get("/api/dashboard/stats");
  return response.data;
}
