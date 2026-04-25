import axios from "axios";

/**
 * Single axios instance for the whole app.
 * Set VITE_API_BASE_URL in .env to point at the real backend.
 * Falls back to /api so a proxy rule in vite.config.js can forward requests.
 */
export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
});

// Attach auth token when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
