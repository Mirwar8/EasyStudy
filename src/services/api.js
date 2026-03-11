const API_URL = "http://localhost:3000";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("easystudy_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Error en la petición a la API");
  }

  return data;
};
