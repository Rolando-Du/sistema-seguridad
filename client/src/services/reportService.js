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

export const getOperationalReport = async (filters = {}) => {
  return apiRequest(`/reports/operational${buildQueryString(filters)}`);
};

export const exportOperationalReportCsv = async (filters = {}) => {
  return apiRequest(`/reports/operational/export/csv${buildQueryString(filters)}`);
};
