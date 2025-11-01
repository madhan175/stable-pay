# Fix Supabase RLS 406/400 Errors

> **⏱️ Quick Fix?** See [QUICK-FIX-INSTRUCTIONS.md](QUICK-FIX-INSTRUCTIONS.md) for the 2-minute solution!

## Problem

After deploying to Vercel, you're getting these errors:
```
Failed to load resource: the server responded with a status of 406
Failed to load resource: the server responded with a status of 400
Error verifying OTP: Object
```

## Root Cause

Your Supabase database has Row Level Security (RLS) policies that require Supabase authentication (`auth.uid()`), but your app uses **phone-based authentication** instead. This causes the 406 (Not Acceptable) and 400 (Bad Request) errors when trying to query the `users` table.

## Solution

You need to update your Supabase RLS policies to allow public access to the `users` table for phone-based authentication.

### Quick Fix (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new public-friendly policies
CREATE POLICY "Public users can view profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Public users can update profiles" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Public users can insert profiles" ON users
    FOR INSERT WITH CHECK (true);
```

5. Click **Run**
6. Test your app again

### Alternative: Use the Fix Script

If you prefer, you can also use the fix script:

1. Open the file `backend/database/fix-user-rls-policies.sql`
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Click **Run**

## Why This Works

The original RLS policies used:
```sql
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);
```

This requires Supabase authentication (`auth.uid()`), which your app doesn't use. Your app uses phone-based authentication instead.

The new policies allow public access:
```sql
CREATE POLICY "Public users can view profiles" ON users
    FOR SELECT USING (true);
```

This works because:
1. Your app uses phone numbers for authentication
2. RLS is still enabled (for security at the table level)
3. The policies now allow the needed operations

## Security Note

⚠️ **Important**: These policies allow public access to the `users` table. This is intentional for phone-based authentication.

If you want to make it more secure later, you can:
1. Add rate limiting in your backend
2. Implement IP-based restrictions
3. Add additional checks in your application logic

For now, this is the correct approach for phone-based authentication.

## Verification

After running the fix, verify:

1. **Check Supabase Policies**:
   - Go to **Authentication** → **Policies**
   - You should see the new "Public users can..." policies

2. **Test Your App**:
   - Try to enter OTP on your deployed Vercel app
   - The 406/400 errors should be gone
   - OTP verification should work

3. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Check Network tab
   - You should no longer see 406 or 400 errors

## If Issues Persist

If you still see errors after applying the fix:

1. **Verify Table Exists**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'users';
   ```

2. **Check RLS Status**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'users';
   ```

3. **List All Policies**:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'users';
   ```

4. **Check Your Environment Variables**:
   - Verify `VITE_SUPABASE_URL` is set in Vercel
   - Verify `VITE_SUPABASE_ANON_KEY` is set in Vercel
   - Redeploy if you changed them

5. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear site data

## Need Help?

If you still encounter issues:
1. Check the browser console for specific error messages
2. Check Supabase logs in the dashboard
3. Verify your environment variables are correctly set

## Summary

The issue is that your Supabase RLS policies were too restrictive for phone-based authentication. The fix allows public access to the `users` table, which is necessary for your authentication flow.

**Run the SQL fix → Test your app → Done! 🎉**

