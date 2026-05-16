import apiRequest from "./apiClient";

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.append(key, value);
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
};

export const getIncidents = async (filters = {}) => {
  return apiRequest(`/incidents${buildQueryString(filters)}`);
};

export const getIncidentById = async (id) => {
  return apiRequest(`/incidents/${id}`);
};

export const createIncident = async (data) => {
  return apiRequest("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateIncident = async (id, data) => {
  return apiRequest(`/incidents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const updateIncidentStatus = async (id, status) => {
  return apiRequest(`/incidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const deleteIncident = async (id) => {
  return apiRequest(`/incidents/${id}`, {
    method: "DELETE",
  });
};
