const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ [SUPABASE] Supabase credentials not configured');
      this.supabase = null;
    } else {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ [SUPABASE] Supabase client initialized');
      } catch (error) {
        console.error('❌ [SUPABASE] Failed to initialize Supabase client:', error);
        this.supabase = null;
      }
    }
  }

  // User operations
  async createUser(userData) {
    if (!this.supabase) {
      console.log('ℹ️ [SUPABASE MOCK] Creating mock user:', userData.phone);
      return { id: 'mock-user-' + Date.now(), ...userData, phone_verified: true, kyc_status: 'none' };
    }
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByPhone(phone) {
    if (!this.supabase) {
      console.log('ℹ️ [SUPABASE MOCK] Getting mock user by phone:', phone);
      // Return a consistent mock user for demo
      return { 
        id: 'mock-uuid-1234-5678', 
        phone, 
        phone_verified: true, 
        kyc_status: 'verified',
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      };
    }
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId, updates) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      // Log the error for debugging
      console.error('❌ [SUPABASE] updateUser error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: userId?.substring(0, 8) + '...'
      });
      throw error;
    }
    
    return data;
  }

  // KYC Document operations
  async createKYCDocument(documentData) {
    const { data, error } = await this.supabase
      .from('kyc_documents')
      .insert([documentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getKYCDocuments(userId) {
    const { data, error } = await this.supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateKYCDocument(documentId, updates) {
    const { data, error } = await this.supabase
      .from('kyc_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Transaction operations
  async createTransaction(transactionData) {
    if (!this.supabase) {
      console.log('ℹ️ [SUPABASE MOCK] Creating mock transaction');
      return { id: 'mock-tx-' + Date.now(), created_at: new Date().toISOString(), ...transactionData };
    }
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTransactions(userId) {
    if (!this.supabase) {
      console.log('ℹ️ [SUPABASE MOCK] Getting mock transactions for:', userId);
      return [
        {
          id: 'mock-tx-1',
          user_id: userId,
          recipient_wallet: '0x1234...5678',
          amount_inr: 1000,
          amount_usdt: 12.05,
          status: 'completed',
          tx_hash: '0xabc...def',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateTransaction(transactionId, updates) {
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // OTP operations
  async storeOTP(phone, otp, expiresAt) {
    const { data, error } = await this.supabase
      .from('otp_storage')
      .insert([{
        phone,
        otp_code: otp,
        expires_at: expiresAt
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async verifyOTP(phone, otp) {
    const { data, error } = await this.supabase
      .from('otp_storage')
      .select('*')
      .eq('phone', phone)
      .eq('otp_code', otp)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async deleteOTP(phone) {
    const { error } = await this.supabase
      .from('otp_storage')
      .delete()
      .eq('phone', phone);
    
    if (error) throw error;
  }

  // Cleanup expired OTPs
  async cleanupExpiredOTPs() {
    const { error } = await this.supabase
      .from('otp_storage')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;
  }
}

module.exports = new SupabaseService();
