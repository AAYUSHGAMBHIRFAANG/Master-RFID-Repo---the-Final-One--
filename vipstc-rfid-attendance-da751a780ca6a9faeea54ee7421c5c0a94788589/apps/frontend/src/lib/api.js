// src/lib/api.js
import axios from "axios";
import toast from "react-hot-toast";

// Base URL points to the Express backend (adjust proxy if needed)
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Friendly error message
    const msg =
      err?.response?.data?.message ||
      err.message ||
      "Request failed. Please try again.";
    toast.error(msg);

    // Auto‑logout on 401
    if (err?.response?.status === 401) {
      sessionStorage.removeItem("AUTH_TOKEN");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
export const fetchMySubjects = () => api.get('/session/mine/subjects');