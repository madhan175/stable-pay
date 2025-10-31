# Supabase Setup Instructions

## Quick Setup Guide for StablePay 2.0

Follow these steps to set up your Supabase database:

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: StablePay2.0 (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start

### Step 2: Run the SQL Setup Script

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `backend/database/setup-supabase.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press F5)

You should see "Success. No rows returned" messages for all steps.

### Step 3: Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- `kyc_documents`
- `otp_codes`
- `otp_storage`
- `transactions`
- `users`

### Step 4: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

### Step 5: Configure Backend Environment

1. Copy `backend/env.example` to `backend/.env`
2. Fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 6: Configure Frontend Environment

1. Create a `.env` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 7: Test the Connection

#### Test Backend:
```bash
cd backend
npm install
npm start
```

Check the console for any Supabase connection errors.

#### Test Frontend:
```bash
npm install
npm run dev
```

Visit http://localhost:5173 and try to:
1. Enter phone number
2. Verify OTP

### Troubleshooting

#### "relation does not exist" error
- Make sure you ran the SQL setup script completely
- Check that all tables were created in Step 3

#### "permission denied" error
- RLS policies are enabled - this is expected for security
- The backend uses `service_role` key which bypasses RLS
- The frontend uses `anon` key with specific policies

#### "duplicate key value" error
- The OTP tables have broad policies for phone verification
- This is expected - old OTPs are cleaned up automatically

### Database Schema Overview

#### `users`
- Stores user phone numbers and profiles
- Tracks KYC status
- Links to wallet addresses

#### `kyc_documents`
- Stores uploaded KYC documents
- Contains OCR extracted data
- Tracks verification status

#### `transactions`
- Records all on-chain transactions
- Tracks status from created to completed
- Stores blockchain tx hashes

#### `otp_storage` / `otp_codes`
- Two tables for OTP verification (backend vs frontend)
- Automatically expire old OTPs
- Public policies for phone verification

### Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Use service_role key ONLY in backend** - Never expose in frontend
3. **RLS is enabled** - Rows are filtered by user_id automatically
4. **Anon key is safe** - Protected by RLS policies

### Next Steps

After setup, you can:
1. Set up Twilio for SMS (see `backend/env.example`)
2. Configure storage bucket if you need file uploads
3. Set up admin users for KYC verification

### Useful Supabase Links

- Dashboard: https://app.supabase.com/project/_/overview
- SQL Editor: https://app.supabase.com/project/_/sql
- Table Editor: https://app.supabase.com/project/_/editor
- Logs: https://app.supabase.com/project/_/logs

### Support

If you encounter issues:
1. Check Supabase dashboard → Logs for errors
2. Verify environment variables are set correctly
3. Ensure SQL script ran without errors
4. Check browser console for frontend errors

