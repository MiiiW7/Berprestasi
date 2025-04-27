// src/utils/axios.js
import axios from 'axios';

// Constant URLs as fallback
const MAIN_BACKEND_URL = 'http://localhost:9000'; // Backend URL
// Alternatif URLs - bisa dicoba jika backend utama bermasalah
// Opsi 1: Gunakan hosting lain seperti Render, Railway, atau Fly.io
// Opsi 2: Jalankan backend lokally dan expose dengan ngrok
const ALTERNATE_BACKEND_URLS = [
  // Uncomment dan isi dengan URL alternatif jika ada
  // 'https://berprestasi-backend.onrender.com',
  // 'https://berprestasi-backend.railway.app',
  // 'https://berprestasi-backend.fly.dev'
];

// Log info koneksi
console.log('Primary API URL:', MAIN_BACKEND_URL);
console.log('Alternative URLs available:', ALTERNATE_BACKEND_URLS.length > 0);

// Create axios instance
const instance = axios.create({
  baseURL: MAIN_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false, // Important for CORS
  timeout: 10000 // Kurangi timeout untuk lebih cepat mendeteksi masalah - 10 detik
});

// Retry mechanism
let currentBackendIndex = -1; // -1 means using the main backend

// Function to switch to next available backend URL
const switchToNextBackend = () => {
  currentBackendIndex++;
  
  if (currentBackendIndex < ALTERNATE_BACKEND_URLS.length) {
    const newBaseURL = ALTERNATE_BACKEND_URLS[currentBackendIndex];
    console.log(`Switching to alternative backend #${currentBackendIndex + 1}:`, newBaseURL);
    instance.defaults.baseURL = newBaseURL;
    return true;
  }
  
  // If we've tried all alternatives, go back to main
  console.log('All alternative backends failed, staying with main backend');
  return false;
};

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Modifikasi URL untuk memastikan tidak menggunakan /api prefix
    if (config.url.startsWith('/api/')) {
      config.url = config.url.replace('/api/', '/');
    }
    
    // Log untuk debugging
    console.log(`Sending ${config.method?.toUpperCase() || 'GET'} request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor untuk debug
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  async (error) => {
    console.error('Request failed:', error.message);
    
    const originalRequest = error.config;
    
    // Implement retry logic for timeout and 504 errors
    if (
      (error.code === 'ECONNABORTED' || 
       (error.response && error.response.status === 504)) && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      // Try switching to next backend
      if (switchToNextBackend()) {
        console.log('Retrying request with alternative backend');
        return instance(originalRequest);
      }
    }
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request details:', error.request);
    }
    
    return Promise.reject(error);
  }
);

// Expose isAxiosError utility
instance.isAxiosError = axios.isAxiosError;

// Health check function
instance.checkHealth = async () => {
  try {
    console.log('Testing backend health...');
    const start = Date.now();
    const response = await axios.get(`${MAIN_BACKEND_URL}/`, { timeout: 5000 });
    const elapsed = Date.now() - start;
    
    console.log(`Backend health check: OK (${elapsed}ms)`);
    return { 
      status: 'healthy', 
      responseTime: elapsed, 
      message: 'Backend is responding' 
    };
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return { 
      status: 'unhealthy', 
      error: error.message,
      message: 'Backend is not responding properly'
    };
  }
};

// Run health check on load
instance.checkHealth().then(health => {
  if (health.status === 'unhealthy') {
    console.warn('ATTENTION: Backend health check failed, some features might not work properly');
    // You could set a global variable or context to show a warning in the UI
  }
});

export default instance;