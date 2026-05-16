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

export const getAuditLogs = async (filters = {}) => {
  return apiRequest(`/audit${buildQueryString(filters)}`);
};
