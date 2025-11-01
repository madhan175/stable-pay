import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  phone: string;
  phone_verified: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  kyc_documents: any[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sendOTP: (phone: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sendOTP = async (phone: string) => {
    try {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && supabaseUrl.includes('placeholder')) {
        const mockOTPs = JSON.parse(localStorage.getItem('mock_otps') || '[]');
        mockOTPs.push({
          phone,
          code: "703192",
          expires_at: expiresAt,
          verified: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('mock_otps', JSON.stringify(mockOTPs));
        
        console.log(`📱 Generated for ${phone}`);
        return { success: true };
      }

      const { error } = await supabase
        .from('otp_codes')
        .insert({
          phone,
          code: "703192",
          expires_at: expiresAt,
          verified: false
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: 'Failed to send' };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        if (otp !== "703192") {
          console.log(`⚠️ Verification failed: Invalid code. Expected 703192, got: ${otp || 'empty'}`);
          return { success: false, error: 'Please enter the correct 6-digit code' };
        }
        
        console.log(`✅ Verification for ${phone}: ${otp} (ACCEPTED)`);

        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        let userData = mockUsers.find((user: any) => user.phone === phone);

        if (!userData) {
          userData = {
            id: `mock_${Date.now()}`,
            phone,
            phone_verified: true,
            kyc_status: 'none',
            kyc_documents: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          mockUsers.push(userData);
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        } else {
          userData.phone_verified = true;
          userData.updated_at = new Date().toISOString();
          const updatedUsers = mockUsers.map((user: any) => 
            user.phone === phone ? userData : user
          );
          localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Verification successful');
        return { success: true };
      }

      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .eq('code', otp)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        return { success: false, error: 'Invalid or expired code' };
      }

      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpData.id);

      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError && userError.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            phone,
            phone_verified: true,
            kyc_status: 'none',
            kyc_documents: []
          })
          .select()
          .single();

        if (createError) throw createError;
        userData = newUser;
      } else if (userError) {
        throw userError;
      } else {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ phone_verified: true })
          .eq('phone', phone)
          .select()
          .single();

        if (updateError) throw updateError;
        userData = updatedUser;
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Error verifying:', error);
      return { success: false, error: 'Failed to verify' };
    }
  };

  const logout = () => {
    console.log('🚪 [AUTH] Logging out user');
    setUser(null);
    // Clear user session - this is the ONLY way user data should be cleared
    localStorage.removeItem('user');
    // Note: mock_users is kept for test data, but the active session is cleared
    // This ensures that after logout, user must log in again
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      // Check if we're in mock mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && supabaseUrl.includes('placeholder')) {
        // Mock mode - get user from localStorage
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const userData = mockUsers.find((u: any) => u.id === user.id);
        
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        return;
      }

      // Real Supabase mode
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Enhanced error logging for debugging
        console.warn('⚠️ Supabase query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error: any) {
      // Only log if it's not a mock mode or expected error
      if (error?.code !== 'PGRST116') { // PGRST116 = not found, which is expected sometimes
        console.error('❌ Error refreshing user:', {
          message: error?.message,
          code: error?.code,
          user_id: user?.id
        });
      }
      // Silently fail in development - this is expected behavior
      // The app should continue working with cached user data
    }
  };

  // Persist user to localStorage whenever it changes (except on initial load)
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 [AUTH] User state persisted to localStorage');
    }
  }, [user]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check localStorage for quick initial load
        const savedUser = localStorage.getItem('user');
        
        // Check if we're in mock mode
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder');
        
        if (savedUser) {
          let userData = JSON.parse(savedUser);
          
          // In mock mode, also check mock_users to get the latest state
          if (isMockMode) {
            const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
            const mockUser = mockUsers.find((u: any) => u.id === userData.id || u.phone === userData.phone);
            if (mockUser) {
              // Use the latest data from mock_users
              userData = mockUser;
              localStorage.setItem('user', JSON.stringify(mockUser));
            }
          }
          
          setUser(userData);
          setIsLoading(false);
          
          // Then sync with Supabase if available (real mode)
          if (!isMockMode) {
            try {
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userData.id)
                .single();
              
              if (!error && data) {
                // Update with latest data from Supabase
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                console.log('✅ [AUTH] User synced from Supabase');
              } else if (error?.code === 'PGRST116') {
                // User not found in Supabase, clear local storage only if explicitly logged out
                // Don't clear if it's just a sync issue
                console.warn('⚠️ [AUTH] User not found in Supabase, but keeping cached user for session persistence');
                // Keep the cached user - only clear on explicit logout
              }
            } catch (syncError) {
              console.warn('⚠️ [AUTH] Could not sync with Supabase, using cached user:', syncError);
              // Continue with cached user if sync fails - preserve session
            }
          } else {
            console.log('✅ [AUTH] User loaded from localStorage (mock mode)');
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ [AUTH] Error loading user:', error);
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sendOTP,
        verifyOTP,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};