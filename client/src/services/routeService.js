import apiRequest from "./apiClient";

export const getNearestBaseByIncident = async (incidentId) => {
  return apiRequest(`/routes/incidents/${incidentId}/nearest-base`);
};
