import apiRequest from "./apiClient";

export const getUsers = async () => {
  return apiRequest("/users");
};

export const createUser = async (data) => {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUser = async (id, data) => {
  return apiRequest(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const updateUserStatus = async (id, active) => {
  return apiRequest(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
};
