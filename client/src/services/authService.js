import apiRequest, { clearSession, saveSession } from "./apiClient";

export const loginRequest = async ({ email, password }) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.success && response.token && response.user) {
    saveSession({
      token: response.token,
      user: response.user,
    });
  }

  return response;
};

export const getProfileRequest = async () => {
  return apiRequest("/auth/profile");
};

export const logoutRequest = () => {
  clearSession();
};
