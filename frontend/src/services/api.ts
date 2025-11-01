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
    // Only log errors - don't show popups for wallet linking errors (they're non-critical)
    if (error.config?.url?.includes('link-wallet')) {
      // Wallet linking errors are expected in some cases (user not found, etc.)
      // Log quietly without showing error to user
      console.warn('⚠️ [API] Wallet link error (non-critical):', {
        status: error.response?.status,
        message: error.response?.data?.message || error.response?.data?.error || error.message,
        url: error.config?.url
      });
    } else {
      // For other errors, log normally
      console.error('❌ [API] Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data || error.message
      });
    }
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
  linkWallet: (userId: string, walletAddress: string, phone?: string) => 
    api.post('/user/link-wallet', { userId, walletAddress, phone }),
};

// Transaction API
export const transactionAPI = {
  create: (data: any) => api.post('/tx/create', data),
  execute: (transactionId: string, data: any) => api.post(`/tx/execute/${transactionId}`, data),
  getHistory: (userId: string) => api.get(`/tx/history/${userId}`),
  downloadReceipt: async (transactionId: string) => {
    const response = await api.get(`/tx/receipt/${transactionId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt-${transactionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
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
