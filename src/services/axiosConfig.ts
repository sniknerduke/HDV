import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from "axios";

// Hàm attach token JWT; đảm bảo headers không bị undefined trước khi gán
const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
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
