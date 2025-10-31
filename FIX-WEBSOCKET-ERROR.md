# Fix WebSocket Connection Error

If you're seeing this error:
```
WebSocket connection to 'ws://localhost:5000/socket.io/' failed
```

This means your frontend is trying to connect to `localhost` instead of your production backend URL.

## Quick Fix Steps

### Step 1: Verify Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your project
3. Go to **Settings** → **Environment Variables**
4. Check if `VITE_API_URL` exists and is set to your backend URL:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
   **Important**: 
   - Use HTTPS (not HTTP)
   - No trailing slash
   - Must start with `VITE_`

### Step 2: Redeploy Frontend

**After adding or updating environment variables, you MUST redeploy:**

1. Go to **Deployments** tab in Vercel
2. Click the **3 dots** (⋮) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-5 minutes)

**OR** trigger a new deployment by:
- Pushing a new commit to your GitHub repository
- Or manually redeploying from Vercel dashboard

### Step 3: Verify the Fix

1. Visit your Vercel frontend URL
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. You should see:
   ```
   🔌 [SOCKET] Connecting to: https://your-backend.onrender.com
   ```
   
   If you see `localhost` instead, the environment variable isn't set correctly.

5. Check for connection:
   - ✅ Should see: `🔗 [SOCKET] Connected to KYC socket server`
   - ❌ If still seeing errors, continue troubleshooting below

## Detailed Troubleshooting

### Issue 1: Environment Variable Not Set

**Symptoms:**
- Console shows: `🔌 [SOCKET] Environment variable: NOT SET (using default)`
- Connection attempts go to `ws://localhost:5000`

**Solution:**
1. Add `VITE_API_URL` in Vercel:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com`
   - Environment: Production (and Preview if needed)
2. Save
3. **Redeploy** the frontend

### Issue 2: Environment Variable Set But Still Using Localhost

**Symptoms:**
- Variable is set in Vercel
- But app still connects to localhost

**Solution:**
This happens when you set the variable AFTER deployment. Vite environment variables are embedded at build time.

1. Verify variable is saved in Vercel
2. **Redeploy** your frontend:
   - Go to Deployments → Latest → Redeploy
   - Or push a new commit
3. Clear browser cache
4. Test again

### Issue 3: Wrong URL Format

**Symptoms:**
- URL is set but connection fails
- CORS or connection errors

**Solution:**
Check the URL format:
- ✅ Correct: `https://stablepay-backend.onrender.com`
- ❌ Wrong: `http://stablepay-backend.onrender.com` (use HTTPS)
- ❌ Wrong: `https://stablepay-backend.onrender.com/` (no trailing slash)
- ❌ Wrong: `ws://stablepay-backend.onrender.com` (don't use WebSocket URL)

### Issue 4: Backend Not Configured for WebSocket

**Symptoms:**
- Frontend is configured correctly
- But Socket.IO can't connect

**Solution:**
1. Check backend is running (test `/health` endpoint)
2. Verify backend CORS allows your frontend URL
3. Check Render logs for Socket.IO connection attempts

## Verification Script

Run this in browser console after visiting your frontend:

```javascript
// Check environment variable
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Check socket connection
const testSocket = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log('Socket should connect to:', url);
  
  if (url.includes('localhost')) {
    console.error('❌ Problem: Using localhost! Set VITE_API_URL in Vercel and redeploy.');
  } else {
    console.log('✅ URL looks correct');
  }
};

testSocket();
```

## Common Mistakes

### ❌ Mistake 1: Variable name wrong
- Wrong: `API_URL` (missing `VITE_` prefix)
- Correct: `VITE_API_URL`

### ❌ Mistake 2: Not redeploying after setting variable
- Environment variables are baked into the build
- Must redeploy after adding/changing them

### ❌ Mistake 3: Wrong environment
- Set variable in Production environment
- Also set in Preview if you use preview deployments

### ❌ Mistake 4: Using HTTP instead of HTTPS
- Wrong: `http://backend.onrender.com`
- Correct: `https://backend.onrender.com`

## After Fixing

Once fixed, you should see:
- ✅ Console: `🔌 [SOCKET] Connecting to: https://your-backend.onrender.com`
- ✅ Console: `🔗 [SOCKET] Connected to KYC socket server`
- ✅ No WebSocket errors
- ✅ Real-time features work (KYC updates, payment notifications)

## Still Having Issues?

1. Check **Network** tab in DevTools:
   - Look for Socket.IO connection attempts
   - Check what URL it's trying to use
   
2. Check **Vercel Build Logs**:
   - Go to Deployments → Latest → Build Logs
   - Verify environment variables are included

3. Check **Render Backend Logs**:
   - Look for Socket.IO connection attempts
   - Check for CORS errors

4. Test backend WebSocket directly:
   - Socket.IO should work on the same URL as your REST API
   - If `/health` works, Socket.IO should work too

---

**Quick Checklist:**
- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] URL is HTTPS (not HTTP)
- [ ] URL has no trailing slash
- [ ] Frontend redeployed after setting variable
- [ ] Browser cache cleared
- [ ] Console shows correct URL (not localhost)

Once all checked, the WebSocket error should be resolved! 🎉

