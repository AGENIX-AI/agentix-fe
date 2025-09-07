import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL from environment
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add request interceptor to attach auth tokens
axiosInstance.interceptors.request.use((config) => {
  const accessToken = Cookies.get('agentix_access_token');
  const refreshToken = Cookies.get('agentix_refresh_token');
  
  // Always ensure headers object exists
  config.headers = config.headers || {};
  
  // Set content type if not already set
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Add authorization header if token exists
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Add refresh token header if it exists
  if (refreshToken) {
    config.headers['X-Refresh-Token'] = refreshToken;
  }

  return config;
});

export default axiosInstance;
