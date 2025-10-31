import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Log API URL on initialization (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('🔗 [API] Base URL:', API_BASE_URL);
  console.log('🔗 [API] Environment variable:', import.meta.env.VITE_API_URL || 'NOT SET (using default)');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

// KYC API
export const kycAPI = {
  uploadDocument: (formData: FormData) => api.post('/kyc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getStatus: (userId: string) => api.get(`/kyc/status/${userId}`),
  verifyKYCDocument: (userId: string, data: { idNumber: string; dob: string; documentId?: string | null; phone?: string | null }) => 
    api.post('/kyc/verify', { userId, ...data }),
};

// User API
export const userAPI = {
  linkWallet: (userId: string, walletAddress: string) => 
    api.post('/user/link-wallet', { userId, walletAddress }),
};

// Transaction API
export const transactionAPI = {
  create: (data: any) => api.post('/tx/create', data),
  execute: (transactionId: string, data: any) => api.post(`/tx/execute/${transactionId}`, data),
  getHistory: (userId: string) => api.get(`/tx/history/${userId}`),
};

// Currency API
export const currencyAPI = {
  convert: (amount: string, from: string, to: string) => api.get(`/currency/convert/${amount}/${from}/${to}`),
};

// Payments API (merchant)
export const paymentsAPI = {
  save: (payload: { txHash: string; sender: string; receiver: string; amount: string | number; timestamp?: string; gasUsed?: string; blockNumber?: string; }) =>
    api.post('/api/transactions', payload),
  listForMerchant: (wallet: string) =>
    api.get(`/api/merchant-transactions`, { params: { wallet } }),
};

export default api;
