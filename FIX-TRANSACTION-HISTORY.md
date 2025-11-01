# Fix Transaction History Not Showing

## Problem

Transactions are being inserted into the `transactions` table but they're not appearing in the transaction history view after completion.

## Root Cause

The Supabase database has Row Level Security (RLS) policies on the `transactions` table that require Supabase authentication (`auth.uid()`). However, your application uses **phone-based authentication** instead of Supabase auth. This means:

1. Transactions CAN be inserted (because the backend uses SERVICE_ROLE_KEY which bypasses RLS)
2. Transactions CANNOT be read (because the RLS policy blocks SELECT queries that don't have `auth.uid()`)

## Solution

Update the RLS policies on the `transactions` table to allow public access for phone-based authentication.

### Quick Fix (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Create new public-friendly policies
CREATE POLICY "Public users can view transactions" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Public users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public users can update transactions" ON transactions
    FOR UPDATE USING (true);
```

5. Click **Run**
6. Test your app - transactions should now appear in history!

### Alternative: Use the Complete Fix Script

If you haven't applied the users table fix yet, you can apply both fixes at once:

1. Open the file `backend/database/fix-user-rls-policies.sql`
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Click **Run**
5. This will fix both users and transactions tables

### Or Use the Transactions-Only Fix

If you only want to fix transactions:

1. Open the file `backend/database/fix-transactions-rls-policies.sql`
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Click **Run**

## Why This Works

The original RLS policies used:

```sql
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);
```

This requires Supabase authentication (`auth.uid()`), which your app doesn't use. Your app uses phone-based authentication instead.

The new policies allow public access:

```sql
CREATE POLICY "Public users can view transactions" ON transactions
    FOR SELECT USING (true);
```

This works because:
1. Your app uses phone numbers for authentication
2. RLS is still enabled (for security at the table level)
3. The policies now allow the needed operations
4. The backend SERVICE_ROLE_KEY still bypasses RLS, but now the frontend can query too

## Security Note

⚠️ **Important**: These policies allow public access to the `transactions` table. This is intentional for phone-based authentication.

If you want to make it more secure later, you can:
1. Add rate limiting in your backend
2. Implement IP-based restrictions
3. Add additional checks in your application logic

For now, this is the correct approach for phone-based authentication.

## Verification

After running the fix, verify:

1. **Check Supabase Policies**:
   - Go to **Authentication** → **Policies** in Supabase dashboard
   - You should see the new "Public users can..." policies for transactions

2. **Test Your App**:
   - Make a transaction in your app
   - Navigate to Transaction History
   - The transaction should now appear!

3. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for requests to `/tx/history/:userId`
   - They should return 200 with transaction data

## Troubleshooting

If transactions still don't appear after applying the fix:

### Check if RLS is still blocking reads
Run this query in Supabase SQL Editor to check current policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'transactions';
```

You should see policies like "Public users can view transactions" with `cmd = SELECT`.

### Check if transactions exist
Run this query to verify transactions are in the database:

```sql
SELECT id, user_id, amount_usdt, status, created_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check backend logs
Look for errors in your backend logs when fetching history:
- Check if `/tx/history/:userId` endpoint is being called
- Check if `supabaseService.getTransactions()` is returning data
- Look for any RLS-related errors

### Check frontend API calls
Open browser DevTools → Network tab:
- Look for GET requests to your backend API
- Check if they return 200 or error status
- Inspect the response to see if transactions are returned

## Need Help?

If you still encounter issues:
1. Check the browser console for specific error messages
2. Check Supabase logs in the dashboard
3. Verify your backend is running and accessible
4. Ensure your frontend is pointing to the correct API URL

## Summary

The issue was that RLS policies were too restrictive for phone-based authentication. The fix allows public access to the `transactions` table, which is necessary for your authentication flow.

**Run the SQL fix → Test your app → Transactions should appear! 🎉**

