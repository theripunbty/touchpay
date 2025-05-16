import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const API_URL = 'https://stack.intellaris.co/api';
const API_TIMEOUT = 15000;

// API Credentials
const API_CREDENTIALS = {
  'x-api-password': 'Ripun54321@#',
  'x-access-code': 'RIPUN-ACCESS-V1',
  'x-api-client-id': 'ripun_7f3b2c9d-84a1-4dcb-90e6-fb17e16ab3da',
  'x-api-secret-id': 'cb85fc11-9ab6-4e52-bd0a-64c9b15166f2'
};

// Storage Keys
const ACCESS_TOKEN_KEY = '@auth_access_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';

// Create Axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...API_CREDENTIALS // Add API credentials to all requests
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Only add token for authenticated routes
    if (config.url && !config.url.includes('/auth/') || 
        config.url?.includes('/auth/refresh-token') || 
        config.url?.includes('/auth/logout')) {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not from a refresh token request
    if (error.response?.status === 401 && 
        originalRequest.url !== '/auth/refresh-token' && 
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          // No refresh token, force logout
          await logout();
          return Promise.reject(error);
        }
        
        // Call refresh token API
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: refreshToken
        }, {
          headers: {
            ...API_CREDENTIALS,
            'Content-Type': 'application/json'
          }
        });
        
        // Store new access token
        const { accessToken } = response.data.data;
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Failed to refresh token, force logout
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  /**
   * Request OTP for the provided phone number
   * @param mobile Phone number (10 digits)
   */
  requestOTP: async (mobile: string): Promise<{ success: boolean; message: string; otp?: string }> => {
    try {
      const response = await api.post('/auth/request-otp', { mobile });
      return {
        success: true,
        message: response.data.message,
        otp: response.data.data?.otp, // Only available in development
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    }
  },

  /**
   * Verify OTP for the provided phone number
   * @param mobile Phone number (10 digits)
   * @param otp OTP received by user
   */
  verifyOTP: async (mobile: string, otp: string): Promise<{ 
    success: boolean; 
    message: string; 
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
  }> => {
    try {
      const response = await api.post('/auth/verify-otp', { mobile, otp });
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Store tokens in AsyncStorage
      if (accessToken) await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      return {
        success: true,
        message: response.data.message,
        accessToken,
        refreshToken,
        userId: user?.id,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP',
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<any> => {
    const userId = await AsyncStorage.getItem('@user_id');
    if (!userId) return null;
    
    try {
      // This endpoint will need to be implemented in your backend
      const response = await api.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  }
};

// Helper to handle logout
const logout = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  await AsyncStorage.removeItem('@user_id');
  // You may want to add navigation logic here or handle in the components
};

export { api, authService }; 