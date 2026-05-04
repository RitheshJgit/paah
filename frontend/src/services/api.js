import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ❗ Debug (helps verify in Netlify)
console.log("🌐 API URL:", API_URL);

if (!API_URL) {
  console.error("❌ VITE_API_URL is not defined");
}

const api = axios.create({
  baseURL: API_URL, // must include /api
  withCredentials: true,
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
