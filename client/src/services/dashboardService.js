import apiRequest from "./apiClient";

export const getDashboardSummary = async () => {
  return apiRequest("/dashboard/summary");
};
