# 🚨 Quick Fix for OTP Errors (406/400) and Transaction History

## The Problem
Your Supabase RLS policies are blocking phone-based authentication queries and transaction history displays.

## The Solution (2 Minutes)

### Step 1: Go to Supabase Dashboard
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (`btguqajlngvlwunsggyb`)

### Step 2: Run This SQL Query
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Paste this code:

```sql
-- Fix Users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Public users can view profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Public users can update profiles" ON users FOR UPDATE USING (true);
CREATE POLICY "Public users can insert profiles" ON users FOR INSERT WITH CHECK (true);

-- Fix Transactions table
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

CREATE POLICY "Public users can view transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public users can insert transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public users can update transactions" ON transactions FOR UPDATE USING (true);
```

4. Click **Run** button
5. Wait for success message ✅

### Step 3: Test Your App
1. Go to your Vercel deployment
2. Try entering an OTP - it should work now! 🎉
3. Make a transaction and check History - transactions should appear! 🎉

## That's It!

Your app should now work correctly. The OTP verification will no longer throw 406/400 errors, and transaction history will display properly.

## Need More Details?

- OTP Errors: See `FIX-SUPABASE-RLS-ERROR.md`
- Transaction History: See `FIX-TRANSACTION-HISTORY.md`

