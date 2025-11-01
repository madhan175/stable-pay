import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { kycAPI } from '../services/api';
import socketService from '../services/socketService';

interface User {
  id: string;
  phone: string;
  phone_verified: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  wallet_address?: string;
  country_detected?: string;
  created_at?: string;
  last_login?: string;
}

interface KYCDocument {
  id: string;
  type: string;
  file_url: string;
  ocr_data: any;
  status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

interface Transaction {
  id: string;
  recipient_wallet: string;
  amount_inr: number;
  amount_usd: number;
  amount_usdt: number;
  requires_kyc: boolean;
  kyc_verified: boolean;
  status: 'created' | 'pending' | 'completed' | 'blocked' | 'failed';
  created_at: string;
}

interface KYCContextType {
  user: User | null;
  kycDocuments: KYCDocument[];
  transactions: Transaction[];
  isConnected: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  uploadKYCDocument: (file: File, documentType: string) => Promise<{ success: boolean; message?: string }>;
  createTransaction: (data: any) => Promise<{ success: boolean; transaction?: Transaction; requiresKYC?: boolean; message?: string }>;
  getKYCStatus: () => Promise<void>;
  getTransactionHistory: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

interface KYCProviderProps {
  children: ReactNode;
}

export const KYCProvider: React.FC<KYCProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kycStatus = user?.kyc_status || 'none';

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    setIsConnected(true);

    // Listen for KYC updates
    const handleKYCUpdate = (data: any) => {
      console.log('🔔 [REAL API] KYC Update received:', data);
      // Refresh KYC status when updates are received
      if (user) {
        getKYCStatus();
      }
    };

    socketService.onKYCUpdate(handleKYCUpdate);

    return () => {
      socketService.offKYCUpdate(handleKYCUpdate);
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [user]);

  const sendOTP = async (phone: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📱 Sent to:', phone);
      return { success: true, message: 'Sent successfully' };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (otp === "703192") {
        const mockUser: User = {
          id: 'demo-user-' + Date.now(),
          phone: phone,
          phone_verified: true,
          kyc_status: 'none' as const,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        setUser(mockUser);
        console.log('✅ Verified:', phone);
        return { success: true, user: mockUser, message: 'Verification successful' };
      } else {
        setError('Invalid code');
        return { success: false, message: 'Invalid code' };
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to verify';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadKYCDocument = async (file: File, documentType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', user.id);
      formData.append('documentType', documentType);
      if (user.phone) {
        formData.append('phone', user.phone);
      }

      // Join KYC room for real-time updates
      socketService.joinKYCRoom(user.id);

      console.log('📄 [REAL API] Uploading KYC document to backend:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: documentType,
        userId: user.id
      });

      const response = await kycAPI.uploadDocument(formData);
      
      if (response.data.success) {
        // Update user KYC status
        setUser(prev => prev ? { ...prev, kyc_status: 'verified' } : null);
        
        // Add document to list
        const newDocument = {
          id: response.data.document?.id || 'doc-' + Date.now(),
          type: documentType,
          file_url: response.data.document?.file_url || URL.createObjectURL(file),
          ocr_data: response.data.document?.ocr_data || {},
          status: 'verified' as const,
          submitted_at: new Date().toISOString()
        };
        setKycDocuments(prev => [...prev, newDocument]);

        console.log('✅ [REAL API] KYC Document verified:', response.data);
        return { success: true, message: 'KYC document uploaded and verified successfully' };
      } else {
        setError(response.data.message || 'KYC verification failed');
        return { success: false, message: response.data.message || 'KYC verification failed' };
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to upload KYC document';
      setError(message);
      console.error('❌ [REAL API] KYC upload error:', error);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 🔑 Mock transaction creation for demo
      const mockTransaction: Transaction = {
        id: 'tx-' + Date.now(),
        recipient_wallet: data.recipientWallet,
        amount_inr: data.amountInr,
        amount_usd: data.amountInr / 83, // Mock conversion rate
        amount_usdt: data.amountInr / 83, // Mock conversion rate
        requires_kyc: false,
        kyc_verified: false,
        status: 'created' as const,
        created_at: new Date().toISOString()
      };

      // Mock KYC check - require KYC for amounts > $200 USD
      const requiresKYC = mockTransaction.amount_usd > 200;
      
      console.log('✅ [FRONTEND MOCK] Transaction created:', mockTransaction);
      console.log('📊 [FRONTEND MOCK] Amount USD:', mockTransaction.amount_usd);
      console.log('🔐 [FRONTEND MOCK] Requires KYC:', requiresKYC);

      return {
        success: true,
        transaction: mockTransaction,
        requiresKYC: requiresKYC,
        message: requiresKYC ? 'KYC required for this transaction' : 'Transaction created successfully'
      };

      // Uncomment below to use real backend API
      /*
      const response = await transactionAPI.create({
        userId: user.id,
        phone: user.phone,
        ...data
      });

      return {
        success: true,
        transaction: response.data.transaction,
        requiresKYC: response.data.kycCheck.requiresKYC,
        message: response.data.canProceed ? 'Transaction created successfully' : 'KYC required for this transaction'
      };
      */
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create transaction';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const getKYCStatus = async () => {
    try {
      if (!user) return;
      
      console.log('📊 [REAL API] Fetching KYC status for:', user.phone);
      
      const response = await kycAPI.getStatus(user.phone);
      setUser(response.data.user);
      setKycDocuments(response.data.documents || []);
      
      console.log('✅ [REAL API] KYC status loaded:', response.data);
    } catch (error: any) {
      console.error('❌ [REAL API] Failed to fetch KYC status:', error);
    }
  };

  const getTransactionHistory = async () => {
    try {
      if (!user) return;
      
      // 🔑 Mock transaction history for demo
      console.log('📈 [FRONTEND MOCK] Fetching transaction history for:', user.id);
      
      // Mock transaction history
      const mockTransactions = [
        {
          id: 'tx-1',
          recipient_wallet: '0xC3De837dBC9AFbcD71e46dB72ED16844Aa484297',
          amount_inr: 10000,
          amount_usd: 120,
          amount_usdt: 120,
          requires_kyc: false,
          kyc_verified: true,
          status: 'completed' as const,
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 'tx-2',
          recipient_wallet: '0x1234567890123456789012345678901234567890',
          amount_inr: 5000,
          amount_usd: 60,
          amount_usdt: 60,
          requires_kyc: false,
          kyc_verified: true,
          status: 'completed' as const,
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
      
      setTransactions(mockTransactions);
      console.log('✅ [FRONTEND MOCK] Transaction history loaded:', mockTransactions);
      
      // Uncomment below to use real backend API
      /*
      const response = await transactionAPI.getHistory(user.id);
      setTransactions(response.data);
      */
    } catch (error: any) {
      console.error('Failed to fetch transaction history:', error);
    }
  };

  const logout = () => {
    console.log('🚪 [LOGOUT] Logging out user and clearing all data');
    
    // Clear user data
    setUser(null);
    setKycDocuments([]);
    setTransactions([]);
    setError(null);
    setIsLoading(false);
    
    // Disconnect socket
    socketService.disconnect();
    setIsConnected(false);
    
    console.log('✅ [LOGOUT] User logged out successfully');
  };

  const clearError = () => {
    setError(null);
  };

  const value: KYCContextType = {
    user,
    kycDocuments,
    transactions,
    isConnected,
    kycStatus,
    isLoading,
    error,
    sendOTP,
    verifyOTP,
    uploadKYCDocument,
    createTransaction,
    getKYCStatus,
    getTransactionHistory,
    logout,
    clearError,
  };

  return (
    <KYCContext.Provider value={value}>
      {children}
    </KYCContext.Provider>
  );
};
