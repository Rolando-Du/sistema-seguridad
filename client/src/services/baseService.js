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

export const getBases = async (filters = {}) => {
  return apiRequest(`/bases${buildQueryString(filters)}`);
};

export const getBaseById = async (id) => {
  return apiRequest(`/bases/${id}`);
};

export const createBase = async (data) => {
  return apiRequest("/bases", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateBase = async (id, data) => {
  return apiRequest(`/bases/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const updateBaseStatus = async (id, active) => {
  return apiRequest(`/bases/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
};

export const deleteBase = async (id) => {
  return apiRequest(`/bases/${id}`, {
    method: "DELETE",
  });
};
