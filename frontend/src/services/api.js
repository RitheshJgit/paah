import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ❗ Safety check (helps catch env issues in production)
if (!API_URL) {
  console.error("❌ VITE_API_URL is not defined");
}

const api = axios.create({
  baseURL: API_URL, // should include /api
  withCredentials: true, // useful if you later use cookies/auth
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;