# 🔧 Supabase Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Error refreshing user" in Console

**Symptoms:**
- Console shows `Error refreshing user: Object`
- App continues to work normally
- Happens during KYC verification or onboarding

**Cause:**
- Supabase is not set up yet (running in mock mode with placeholders)
- Or Supabase connection failed due to missing credentials

**Solution:**
This is **expected behavior** when Supabase isn't configured yet. The app handles it gracefully.

To fix properly:
1. Set up Supabase (see `SETUP-INSTRUCTIONS.md`)
2. Add credentials to `.env` files
3. Restart dev server

**The error has been improved** in `AuthContext.tsx` to show detailed information instead of just "Object".

---

### Issue 2: "relation does not exist"

**Symptoms:**
- Error: `relation "users" does not exist`
- Backend fails to start

**Solution:**
Run the SQL setup script in Supabase SQL Editor:
1. Open `backend/database/setup-supabase.sql`
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Click Run

---

### Issue 3: "permission denied for table users"

**Symptoms:**
- Error: `permission denied for table users`
- Frontend can't access user data

**Cause:**
- RLS policies are working correctly
- Backend should use `service_role` key, not `anon` key

**Solution:**
Check your `.env` files:

**Backend (`backend/.env`):**
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # Backend needs this!
```

**Frontend (root `.env`):**
```env
VITE_SUPABASE_ANON_KEY=your-anon-key-here  # Frontend uses this
```

The backend's `service_role` key bypasses RLS. The frontend's `anon` key is protected by RLS.

---

### Issue 4: "duplicate key value violates unique constraint"

**Symptoms:**
- Error when creating user
- "duplicate key value" message

**Cause:**
- Phone number already exists in database

**Solution:**
This is expected - phone numbers must be unique. Delete the old user or use a different phone number.

**To delete test data:**
```sql
-- Delete test user by phone number
DELETE FROM users WHERE phone = '+1234567890';

-- Or delete all test data
DELETE FROM transactions;
DELETE FROM kyc_documents;
DELETE FROM otp_storage;
DELETE FROM otp_codes;
DELETE FROM users;
```

---

### Issue 5: Mock Mode vs Real Supabase

**How to tell which mode you're in:**
- Check console logs for `✅ Tesseract.js OCR initialized`
- If you see "Mock mode" messages, you're in mock mode
- If database operations work, you're in real mode

**Switch to real Supabase:**
1. Follow `SETUP-INSTRUCTIONS.md`
2. Add real credentials to `.env`
3. Restart dev servers

---

### Issue 6: RLS Policy Errors

**Symptoms:**
- "new row violates row-level security policy"
- Frontend can't insert/update data

**Common causes:**
1. User not authenticated (no `auth.uid()`)
2. Policy checking wrong field
3. Policy logic incorrect

**Debug:**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test query as specific user
SET LOCAL role 'authenticator';
SET LOCAL request.jwt.claim.sub = 'your-user-id';
SELECT * FROM users;
```

**Fix:**
See the policies in `setup-supabase.sql` lines 104-160. The app uses `auth.uid()` which requires Supabase Auth. If you're not using Supabase Auth, you may need to modify the policies.

---

### Issue 7: OTP Not Working

**Symptoms:**
- Can't send OTP
- OTP never arrives
- "Invalid OTP" errors

**Checks:**
1. Is Twilio configured? (See `backend/env.example`)
2. Is `otp_codes` table created?
3. Check backend logs for Twilio errors

**Test OTP in database:**
```sql
-- Check recent OTPs
SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 10;

-- Manually create OTP for testing
INSERT INTO otp_codes (phone, code, expires_at)
VALUES ('+1234567890', '123456', NOW() + INTERVAL '10 minutes')
RETURNING *;
```

---

### Issue 8: Environment Variables Not Loading

**Symptoms:**
- Supabase URL shows as "placeholder"
- API keys not working
- Mock mode when you want real mode

**Check:**
1. `.env` file exists in correct location
2. Variables have correct names (`VITE_` prefix for frontend)
3. Dev server restarted after changes
4. No typos in variable names

**Quick test:**
```javascript
// Add to any component temporarily
console.log('Env check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});
```

---

### Issue 9: Database Connection Timeout

**Symptoms:**
- Requests hang forever
- "Connection timeout" errors
- Network errors in console

**Causes:**
1. Wrong Supabase URL
2. Firewall blocking connection
3. Supabase project paused (free tier)

**Check:**
1. Verify URL in Supabase dashboard
2. Check if project is paused
3. Try from different network (firewall issue)

---

### Issue 10: Cannot Read Properties of Undefined

**Symptoms:**
- Console error about undefined properties
- User data missing

**Cause:**
- User not loaded yet
- Async operations not awaited

**Debug:**
```javascript
// Check user state
console.log('User state:', user);

// Check localStorage
console.log('Cached user:', localStorage.getItem('user'));
```

**Fix:**
Add null checks before accessing user properties.

---

## 🔍 Debugging Commands

### Check Database Connection
```sql
-- In Supabase SQL Editor
SELECT NOW();
```

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check User Count
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN phone_verified THEN 1 END) as verified_phones,
  COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) as verified_kyc
FROM users;
```

### View Recent Activity
```sql
-- Recent users
SELECT phone, kyc_status, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Recent transactions
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Pending KYC documents
SELECT u.phone, kd.type, kd.status, kd.submitted_at
FROM kyc_documents kd
JOIN users u ON kd.user_id = u.id
WHERE kd.status = 'pending'
ORDER BY kd.submitted_at ASC;
```

### Clean Up Test Data
```sql
-- Archive old OTPs (keep last 24 hours)
DELETE FROM otp_storage WHERE expires_at < NOW() - INTERVAL '1 day';
DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '1 day';

-- Remove old test data
DELETE FROM transactions WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';
```

---

## 📞 Still Having Issues?

1. Check backend logs: `cd backend && npm start`
2. Check browser console for errors
3. Check Supabase dashboard → Logs
4. Verify `.env` files are correct
5. Ensure SQL setup script ran successfully
6. Check network tab for failed requests

---

**Remember:** Most errors are harmless in development. The app has fallbacks and mock modes to keep working even without full setup.

