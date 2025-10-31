-- =============================================================================
-- SUPABASE SETUP SCRIPT FOR STABLEPAY 2.0
-- =============================================================================
-- Copy and paste this entire file into your Supabase SQL Editor
-- Execute it step by step or all at once
-- =============================================================================

-- Step 1: Enable necessary extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create Users table
-- =============================================================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
    wallet_address VARCHAR(42),
    country_detected VARCHAR(10),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create KYC Documents table
-- =============================================================================
CREATE TABLE kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('national_id', 'passport', 'driving_license', 'pan_card')),
    file_url TEXT NOT NULL,
    ocr_data JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);

-- Step 4: Create Transactions table
-- =============================================================================
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_wallet VARCHAR(42) NOT NULL,
    amount_inr DECIMAL(18, 2) NOT NULL,
    amount_usd DECIMAL(18, 2) NOT NULL,
    amount_usdt DECIMAL(18, 6) NOT NULL,
    requires_kyc BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'pending', 'completed', 'blocked', 'failed')),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    gas_used BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Step 5: Create OTP Storage table (for phone verification)
-- =============================================================================
CREATE TABLE otp_storage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create OTP Codes table (alternative format used by frontend)
-- =============================================================================
CREATE TABLE otp_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for better performance
-- =============================================================================
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_otp_storage_phone ON otp_storage(phone);
CREATE INDEX idx_otp_storage_expires_at ON otp_storage(expires_at);
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Step 8: Enable Row Level Security (RLS)
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS Policies
-- =============================================================================
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- KYC documents policies
CREATE POLICY "Users can view own KYC documents" ON kyc_documents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own KYC documents" ON kyc_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own KYC documents" ON kyc_documents
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- OTP storage policies (public for verification)
CREATE POLICY "Anyone can insert OTP" ON otp_storage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view OTP" ON otp_storage
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP" ON otp_storage
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete OTP" ON otp_storage
    FOR DELETE USING (true);

-- OTP codes policies (public for verification)
CREATE POLICY "Anyone can insert OTP codes" ON otp_codes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view OTP codes" ON otp_codes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update OTP codes" ON otp_codes
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete OTP codes" ON otp_codes
    FOR DELETE USING (true);

-- Step 10: Create functions for automatic timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create triggers for updated_at
-- =============================================================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Create function to cleanup expired OTPs (optional)
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_storage WHERE expires_at < NOW();
    DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 13: Enable anonymous access (if needed for public API)
-- =============================================================================
-- Note: The application should use service_role_key for backend operations
-- Anon key is for client-side operations if you enable it

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Your tables are now ready. You can verify by running:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- =============================================================================

