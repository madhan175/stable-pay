# 📦 Supabase Database Setup

This directory contains all the files you need to set up your Supabase database for StablePay 2.0.

## 🚀 Quick Start

**Just want the SQL?** Open `setup-supabase.sql` and copy-paste into Supabase SQL Editor.

---

## 📁 Files in This Directory

### 1️⃣ `setup-supabase.sql` ⭐ **START HERE**
**Main SQL script to run in Supabase SQL Editor**

Contains:
- ✅ Complete database schema
- ✅ All 5 tables (users, kyc_documents, transactions, otp_storage, otp_codes)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers and functions
- ✅ Comments explaining each step

**How to use:**
1. Open Supabase dashboard → SQL Editor
2. Open this file
3. Copy everything
4. Paste into SQL Editor
5. Click Run (F5)

---

### 2️⃣ `SETUP-INSTRUCTIONS.md`
**Detailed step-by-step guide**

Includes:
- Creating Supabase project
- Getting API keys
- Configuring backend/frontend
- Troubleshooting tips
- Security notes

**Read this if:** You're new to Supabase or need help with configuration.

---

### 3️⃣ `supabase-visual-guide.md`
**Visual reference and SQL examples**

Contains:
- 📊 Database structure diagram
- 🔒 Security policy explanations
- 📝 Common SQL queries
- 🧪 Testing commands
- 📈 Monitoring queries

**Read this if:** You want to understand the schema or run manual queries.

---

### 4️⃣ `supabase-schema.sql`
**Original schema file**

This was the original schema. Use `setup-supabase.sql` instead (it's more complete).

---

## 🎯 Which File Should I Use?

| Your Goal | File to Use |
|-----------|-------------|
| Just set up the database now | `setup-supabase.sql` |
| Need detailed instructions | `SETUP-INSTRUCTIONS.md` |
| Understand the structure | `supabase-visual-guide.md` |
| Run custom queries | `supabase-visual-guide.md` |

---

## 📋 Setup Checklist

- [ ] Created Supabase project at https://supabase.com
- [ ] Ran `setup-supabase.sql` in SQL Editor
- [ ] Got API keys from Settings → API
- [ ] Created `backend/.env` file
- [ ] Added Supabase credentials to backend `.env`
- [ ] Created root `.env` file for frontend
- [ ] Added Supabase credentials to frontend `.env`
- [ ] Tested backend connection
- [ ] Tested frontend connection

---

## 🗂️ Database Tables Created

| Table | Records What | Records |
|-------|-------------|---------|
| `users` | User profiles | Phone numbers, KYC status, wallets |
| `kyc_documents` | ID documents | Uploaded docs with OCR data |
| `transactions` | Blockchain txns | All on-chain transactions |
| `otp_storage` | Backend OTPs | Phone verification codes |
| `otp_codes` | Frontend OTPs | Phone verification codes |

---

## 🔐 Security

✅ **Row Level Security (RLS) enabled on all tables**
✅ **Users can only access their own data**
✅ **OTP tables are public (needed for verification)**
✅ **Backend uses service_role key**
✅ **Frontend uses anon key (protected by RLS)**

---

## 🧪 Quick Test

After setup, run this in SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return: kyc_documents, otp_codes, otp_storage, transactions, users
```

---

## 📚 Additional Resources

- **Quick Start Guide:** See `SUPABASE-QUICK-START.md` in project root
- **Visual Guide:** See `supabase-visual-guide.md` in this directory
- **Supabase Docs:** https://supabase.com/docs

---

## ❓ Common Issues

### "relation does not exist"
→ You didn't run the SQL script yet. Run `setup-supabase.sql` now.

### "permission denied"
→ This is normal! RLS is working. Backend uses service_role key to bypass it.

### "Invalid API key"
→ Check your `.env` files have the correct keys from Supabase dashboard.

### "Duplicate key value"
→ OTP tables allow multiple codes per phone. This is expected.

---

## 🆘 Need Help?

1. Read `SETUP-INSTRUCTIONS.md` for detailed steps
2. Check `supabase-visual-guide.md` for examples
3. Verify your `.env` files are configured correctly
4. Check Supabase dashboard → Logs for errors

---

**You're all set!** 🎉

