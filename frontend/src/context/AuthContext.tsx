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
      // Generate fake 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Check if we're in mock mode (placeholder Supabase URL)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && supabaseUrl.includes('placeholder')) {
        // Mock mode - store OTP in localStorage
        const mockOTPs = JSON.parse(localStorage.getItem('mock_otps') || '[]');
        mockOTPs.push({
          phone,
          code: otp,
          expires_at: expiresAt,
          verified: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('mock_otps', JSON.stringify(mockOTPs));
        
        console.log(`🎯 Mock OTP for ${phone}: ${otp}`);
        return { success: true, otp };
      }

      // Real Supabase mode
      const { error } = await supabase
        .from('otp_codes')
        .insert({
          phone,
          code: otp,
          expires_at: expiresAt,
          verified: false
        });

      if (error) throw error;

      // In a real app, you'd send SMS here
      // For demo, we return the OTP
      return { success: true, otp };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      // Check if we're in mock mode (placeholder Supabase URL)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Always use mock mode for development
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        // Mock mode - Validate OTP format (must be 6 digits)
        // In development, accept any 6-digit OTP, but still require it to be entered
        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
          console.log(`⚠️ Mock OTP verification failed: Invalid OTP format. Expected 6 digits, got: ${otp || 'empty'}`);
          return { success: false, error: 'Please enter a valid 6-digit OTP' };
        }
        
        console.log(`🎯 Mock OTP verification for ${phone}: ${otp} (ACCEPTED)`);

        // Check if user exists in localStorage
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        let userData = mockUsers.find((user: any) => user.phone === phone);

        if (!userData) {
          // Create new user
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
          // Update existing user
          userData.phone_verified = true;
          userData.updated_at = new Date().toISOString();
          const updatedUsers = mockUsers.map((user: any) => 
            user.phone === phone ? userData : user
          );
          localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Mock OTP verification successful - proceeding to next page');
        return { success: true };
      }

      // Real Supabase mode
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
        return { success: false, error: 'Invalid or expired OTP' };
      }

      // Mark OTP as verified
      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpData.id);

      // Check if user exists
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create new user
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
        // Update existing user
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
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'Failed to verify OTP' };
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