# 🚀 Supabase Quick Start Guide

## What You Need to Do in Supabase SQL Editor

### ✅ Step 1: Go to Supabase SQL Editor
1. Log in to https://app.supabase.com
2. Select your project (or create one)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### ✅ Step 2: Copy & Paste This SQL

**Open this file:** `backend/database/setup-supabase.sql`

**Copy everything** and paste into the SQL Editor, then click **Run** (or press F5).

This will create:
- ✅ 5 database tables (users, kyc_documents, transactions, otp_storage, otp_codes)
- ✅ All necessary indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers and functions

### ✅ Step 3: Get Your Keys

Go to **Settings** → **API** and copy:
- Project URL (e.g., `https://xxxxx.supabase.co`)
- `anon` `public` key
- `service_role` `secret` key

### ✅ Step 4: Update Your .env Files

**Backend (`backend/.env`):**
```env
SUPABASE_URL=your-project-url-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Frontend (root `.env`):**
```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### ✅ Step 5: Verify Setup

Run this query in SQL Editor to check tables:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- kyc_documents
- otp_codes
- otp_storage
- transactions
- users

---

## 🎯 That's It!

Your database is ready. Start your backend and frontend servers:

```bash
# Backend
cd backend && npm start

# Frontend (new terminal)
npm run dev
```

---

## 📋 Summary of Created Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles, phone numbers, KYC status |
| `kyc_documents` | Uploaded ID documents with OCR data |
| `transactions` | Blockchain transaction records |
| `otp_storage` | Backend OTP codes for verification |
| `otp_codes` | Frontend OTP codes for verification |

---

## ⚠️ Important Notes

1. **Never share your `service_role` key** - it bypasses all security
2. **The `anon` key is safe** - it's protected by RLS policies
3. **All tables have Row Level Security enabled** for protection
4. **Old OTPs auto-expire** and get cleaned up

---

## 🆘 Need Help?

See detailed instructions in: `backend/database/SETUP-INSTRUCTIONS.md`

