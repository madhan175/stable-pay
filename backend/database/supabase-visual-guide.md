# 📊 Supabase Database Visual Guide

## 🏗️ Database Structure

```
StablePay2.0 Database
│
├── 👤 users
│   ├── id (UUID)
│   ├── phone (unique)
│   ├── phone_verified
│   ├── kyc_status (none/pending/verified/rejected)
│   ├── wallet_address
│   └── timestamps
│
├── 📄 kyc_documents
│   ├── id
│   ├── user_id → users.id
│   ├── type (national_id/passport/driving_license/pan_card)
│   ├── file_url
│   ├── ocr_data (JSON)
│   ├── status
│   └── timestamps
│
├── 💰 transactions
│   ├── id
│   ├── user_id → users.id
│   ├── recipient_wallet
│   ├── amount_inr / amount_usd / amount_usdt
│   ├── requires_kyc / kyc_verified
│   ├── status
│   ├── tx_hash
│   └── timestamps
│
├── 🔐 otp_storage (Backend)
│   ├── id
│   ├── phone
│   ├── otp_code
│   └── expires_at
│
└── 🔐 otp_codes (Frontend)
    ├── id
    ├── phone
    ├── code
    ├── verified
    └── expires_at
```

## 🔒 Security Layers

### Row Level Security (RLS) - All Tables Enabled

| Table | User Access | Policy |
|-------|------------|--------|
| `users` | 👁️ SELECT | Own profile only |
| `users` | ✏️ UPDATE | Own profile only |
| `kyc_documents` | 👁️ SELECT | Own documents |
| `kyc_documents` | ➕ INSERT | Own documents |
| `kyc_documents` | ✏️ UPDATE | Own documents |
| `transactions` | 👁️ SELECT | Own transactions |
| `transactions` | ➕ INSERT | Own transactions |
| `transactions` | ✏️ UPDATE | Own transactions |
| `otp_storage` | All operations | Public (for verification) |
| `otp_codes` | All operations | Public (for verification) |

## 🎯 API Keys Usage

### Backend (Node.js) → `service_role` key
- ✅ Full database access
- ✅ Bypasses RLS
- ✅ For admin operations
- ⚠️ **NEVER expose in frontend**

### Frontend (React) → `anon` key
- ✅ Limited by RLS policies
- ✅ Users see only their data
- ✅ Safe for client-side use

## 📝 Quick SQL Commands

### Check All Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Count Records
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'kyc_documents', COUNT(*) FROM kyc_documents;
```

### View Recent Users
```sql
SELECT phone, kyc_status, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Pending KYC Documents
```sql
SELECT u.phone, kd.type, kd.status, kd.submitted_at
FROM kyc_documents kd
JOIN users u ON kd.user_id = u.id
WHERE kd.status = 'pending'
ORDER BY kd.submitted_at ASC;
```

### View Recent Transactions
```sql
SELECT 
  u.phone,
  t.amount_inr,
  t.amount_usdt,
  t.status,
  t.created_at
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

### Cleanup Expired OTPs
```sql
DELETE FROM otp_storage WHERE expires_at < NOW();
DELETE FROM otp_codes WHERE expires_at < NOW();
```

## 🛠️ Common Operations

### Create a Test User (for development)
```sql
INSERT INTO users (phone, phone_verified, kyc_status)
VALUES ('+1234567890', true, 'none')
RETURNING *;
```

### Update User KYC Status
```sql
UPDATE users 
SET kyc_status = 'verified' 
WHERE phone = '+1234567890'
RETURNING *;
```

### Add a KYC Document
```sql
INSERT INTO kyc_documents (user_id, type, file_url, ocr_data)
SELECT 
  id,
  'national_id',
  'https://example.com/id.jpg',
  '{"name": "John Doe", "id_number": "12345"}'::jsonb
FROM users 
WHERE phone = '+1234567890'
RETURNING *;
```

### Create a Transaction
```sql
INSERT INTO transactions (
  user_id, 
  recipient_wallet, 
  amount_inr, 
  amount_usd, 
  amount_usdt, 
  status
)
SELECT 
  id,
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  1000.00,
  12.00,
  12.000000,
  'pending'
FROM users 
WHERE phone = '+1234567890'
RETURNING *;
```

## 📊 Indexes for Performance

All these indexes are automatically created:

```sql
✅ idx_users_phone              -- Fast phone lookups
✅ idx_users_kyc_status         -- Filter by KYC status
✅ idx_kyc_documents_user_id    -- User's documents
✅ idx_kyc_documents_status     -- Filter pending documents
✅ idx_transactions_user_id     -- User's transactions
✅ idx_transactions_status      -- Filter by status
✅ idx_transactions_created_at  -- Sort by date
✅ idx_otp_storage_phone        -- OTP lookups
✅ idx_otp_storage_expires_at   -- Cleanup expired OTPs
✅ idx_otp_codes_phone          -- OTP lookups
✅ idx_otp_codes_expires_at     -- Cleanup expired OTPs
```

## 🔄 Automatic Functions

### 1. Auto Update Timestamp
```sql
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: users table
```

### 2. Cleanup Expired OTPs
```sql
CREATE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_storage WHERE expires_at < NOW();
    DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

## 🧪 Testing Your Setup

### Test 1: Create User
```sql
INSERT INTO users (phone, phone_verified, kyc_status)
VALUES ('+9999999999', true, 'none');
```

### Test 2: Create OTP
```sql
INSERT INTO otp_codes (phone, code, expires_at)
VALUES ('+9999999999', '123456', NOW() + INTERVAL '5 minutes');
```

### Test 3: Verify OTP
```sql
SELECT * FROM otp_codes 
WHERE phone = '+9999999999' 
  AND code = '123456'
  AND expires_at > NOW()
  AND verified = false;
```

### Test 4: Update OTP as Verified
```sql
UPDATE otp_codes 
SET verified = true 
WHERE phone = '+9999999999' 
  AND code = '123456';
```

### Cleanup Test Data
```sql
DELETE FROM users WHERE phone = '+9999999999';
```

## 📈 Monitoring Queries

### User Growth
```sql
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as new_users
FROM users
GROUP BY day
ORDER BY day DESC
LIMIT 30;
```

### KYC Completion Rate
```sql
SELECT 
  kyc_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
GROUP BY kyc_status;
```

### Transaction Volume
```sql
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as transactions,
  SUM(amount_usdt) as total_usdt
FROM transactions
WHERE status = 'completed'
GROUP BY day
ORDER BY day DESC
LIMIT 30;
```

## ⚠️ Reset Everything (Development Only!)

```sql
-- DROP ALL TABLES (Be careful!)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS otp_storage CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run setup-supabase.sql
```

---

**For detailed setup instructions, see:** `SETUP-INSTRUCTIONS.md`

