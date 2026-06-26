import axios from "axios";

// In local dev, Vite proxies "/api" straight to Flask (see vite.config.js),
// so the relative path works with no configuration.
// In production, the frontend and backend are on different domains
// (Vercel + Render), so VITE_API_URL must point at the deployed backend.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every outgoing request, if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error normalization + auto-logout on 401.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401) {
      localStorage.removeItem("ra_token");
      localStorage.removeItem("ra_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
