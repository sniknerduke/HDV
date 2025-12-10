import axios from "axios";

// Hàm attach token JWT
const attachToken = (config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Chỉ cần 1 instance duy nhất cho gateway
export const api = axios.create({
  baseURL: "http://localhost:9090/api", // Gateway endpoint
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn interceptor để tự động thêm JWT
api.interceptors.request.use(attachToken);
