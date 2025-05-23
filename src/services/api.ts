import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // Replace with your actual API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Set withCredentials to true to include cookies with cross-origin requests
api.defaults.withCredentials = true;

// Request interceptor for adding auth headers
api.interceptors.request.use(
  (config) => {
    // With HttpOnly cookies enabled (withCredentials: true),
    // the cookies will be sent automatically with the request
    //
    // The backend expects these specific headers, so we add them
    // The actual token values will be extracted from cookies by the server

    // The server will extract the token from the cookie and validate it
    config.headers["Authorization"] = `Bearer token`; // The actual token is in the cookie
    config.headers["X-Refresh-Token"] = "refresh"; // The actual refresh token is in the cookie

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access, but only redirect if not already on login page
      // and not requesting auth-related endpoints
      localStorage.removeItem("token");

      const isAuthEndpoint = error.config?.url?.includes("/auth/");
      const isAlreadyOnLoginPage = window.location.pathname === "/login";

      if (!isAlreadyOnLoginPage && !isAuthEndpoint) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
