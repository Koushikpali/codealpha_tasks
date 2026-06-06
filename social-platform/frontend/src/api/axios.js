import axios from "axios";

// Base URL for API — proxied through Vite in dev
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devconnect_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      const isAuthRoute = ["/auth/login", "/auth/register"].some((r) =>
        window.location.pathname.includes(r)
      );
      if (!isAuthRoute) {
        localStorage.removeItem("devconnect_token");
        localStorage.removeItem("devconnect_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
