import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

const api: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5001/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ============================
// RESPONSE INTERCEPTOR
// ============================
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // ============================
    // If Access Token Expired (401)
    // ============================
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Trying to refresh token...");

        const refreshResponse = await axios.post(
          "/auth/refresh",
          {},
          {
            baseURL:
              process.env.NEXT_PUBLIC_BASE_URL ||
              "http://localhost:5001/",
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        // Attach new token to header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.log("❌ Refresh failed. Redirecting to login.");

        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
