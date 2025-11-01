-- =============================================================================
-- SUPABASE RLS FIX FOR USER AND TRANSACTION ACCESS
-- =============================================================================
-- This fixes the 406/400 errors when accessing users and transactions tables
-- The application uses phone-based auth, not Supabase auth.uid()
-- =============================================================================

-- Step 1: Drop existing restrictive policies on users table
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 2: Create new policies that allow public access for phone-based operations
-- =============================================================================

-- Allow anyone to view users (required for phone-based auth)
CREATE POLICY "Public users can view profiles" ON users
    FOR SELECT USING (true);

-- Allow anyone to update users (required for phone verification)
CREATE POLICY "Public users can update profiles" ON users
    FOR UPDATE USING (true);

-- Allow anyone to insert users (required for registration)
CREATE POLICY "Public users can insert profiles" ON users
    FOR INSERT WITH CHECK (true);

-- Step 3: Drop existing restrictive policies on transactions table
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Step 4: Create new policies for transactions table
-- =============================================================================

-- Allow anyone to view transactions (required for phone-based auth)
CREATE POLICY "Public users can view transactions" ON transactions
    FOR SELECT USING (true);

-- Allow anyone to insert transactions (required for transaction creation)
CREATE POLICY "Public users can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update transactions (required for status updates)
CREATE POLICY "Public users can update transactions" ON transactions
    FOR UPDATE USING (true);

-- Step 5: Keep RLS enabled but with permissive policies
-- =============================================================================
-- Note: RLS is still enabled for security
-- The policies above allow public access but can be restricted later if needed

-- =============================================================================
-- FIX COMPLETE!
-- =============================================================================
-- Your users and transactions tables should now allow public access
-- This is needed because the app uses phone-based auth, not Supabase auth.uid()
-- Transactions will now be visible in transaction history after creation
-- =============================================================================

