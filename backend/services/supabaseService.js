const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // User operations
  async createUser(userData) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByPhone(phone) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId, updates) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
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
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTransactions(userId) {
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
