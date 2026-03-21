import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

const token = localStorage.getItem("altheryx-token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("altheryx-token");
      localStorage.removeItem("altheryx-user");
      localStorage.removeItem("altheryx-workspace");
      localStorage.removeItem("altheryx-is-master");
      const path = window.location.pathname;
      if (!path.includes("/login") && !path.includes("/admin")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
