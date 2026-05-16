const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => {
  return localStorage.getItem("seguridad_token");
};

export const getStoredUser = () => {
  const user = localStorage.getItem("seguridad_user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("seguridad_user");
    return null;
  }
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem("seguridad_token", token);
  localStorage.setItem("seguridad_user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("seguridad_token");
  localStorage.removeItem("seguridad_user");
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");

  let data = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.mensaje ||
      "Ocurrió un error al comunicarse con el servidor.";

    throw new Error(message);
  }

  return data;
};

export default apiRequest;
