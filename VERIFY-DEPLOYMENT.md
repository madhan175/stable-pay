# How to Verify Backend (Render) ↔ Frontend (Vercel) Connection

This guide helps you verify that your backend on Render and frontend on Vercel are properly connected.

## Prerequisites

- Backend deployed on Render
- Frontend deployed on Vercel
- Your deployment URLs

## Step 1: Get Your Deployment URLs

### Backend URL (Render)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open your backend service
3. Copy the **Service URL** (e.g., `https://stablepay-backend.onrender.com`)

### Frontend URL (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your project
3. Copy the **Production URL** (e.g., `https://your-project.vercel.app`)

---

## Step 2: Verify Backend is Running

### Check 1: Backend Health Endpoint

**Using Browser:**
```
Visit: https://your-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Using Command Line (PowerShell):**
```powershell
Invoke-RestMethod -Uri "https://your-backend.onrender.com/health" -Method Get
```

**Using Command Line (curl):**
```bash
curl https://your-backend.onrender.com/health
```

✅ **Success**: If you get `{"status":"OK",...}` your backend is running!

---

## Step 3: Verify Frontend Environment Variables

### Check 1: Verify Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables exist:
   - ✅ `VITE_API_URL` = `https://your-backend.onrender.com`
   - ✅ `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - ✅ `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

**Important**: 
- Variable names must start with `VITE_`
- After adding/updating variables, **redeploy** your frontend

### Check 2: Verify Frontend is Using Correct API URL

**Method 1: Browser Console**
1. Visit your Vercel frontend URL
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type:
```javascript
console.log(import.meta.env.VITE_API_URL)
```
5. Press Enter
6. ✅ **Success**: Should show your backend URL: `https://your-backend.onrender.com`

**Method 2: Network Tab**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for API calls to your backend URL
5. ✅ **Success**: You should see requests going to `https://your-backend.onrender.com/...`

---

## Step 4: Verify CORS Configuration

### Check 1: Backend CORS Settings (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open your backend service
3. Go to **Environment** tab
4. Verify `ALLOWED_ORIGINS` includes your frontend URL:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
   **Important**: 
   - No trailing slash
   - Use HTTPS (not HTTP)
   - Exact match required

5. If you changed it, **restart the service** (it auto-restarts when you save)

### Check 2: Test CORS from Browser

1. Visit your frontend on Vercel
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type:
```javascript
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err))
```
5. Press Enter

✅ **Success**: Should see `✅ CORS OK: {status: "OK", ...}`
❌ **Error**: If you see CORS error, check `ALLOWED_ORIGINS` in Render

---

## Step 5: Test API Endpoints from Frontend

### Test 1: OTP Send (Test API Connection)

1. Visit your Vercel frontend
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type:
```javascript
fetch('https://your-backend.onrender.com/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '+1234567890' })
})
.then(r => r.json())
.then(data => console.log('✅ API Works:', data))
.catch(err => console.error('❌ API Error:', err))
```
5. Press Enter

✅ **Success**: Should see response with OTP message
❌ **Error**: Check backend logs in Render dashboard

### Test 2: Full Login Flow

1. Visit your Vercel frontend
2. Try to verify phone number with OTP `123456`
3. ✅ **Success**: Login should work
4. Check **Network** tab in DevTools for successful API calls

---

## Step 6: Check Backend Logs (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open your backend service
3. Go to **Logs** tab
4. Look for:
   - ✅ Successful requests from your frontend domain
   - ❌ CORS errors (if any)
   - ❌ API errors (if any)

**Common Log Patterns:**
```
✅ Good: "POST /auth/send-otp 200"
✅ Good: "GET /health 200"
❌ Bad: "CORS policy blocked"
❌ Bad: "Error: Connection refused"
```

---

## Step 7: Check Frontend Logs (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your project
3. Go to **Deployments**
4. Click on latest deployment
5. Go to **Functions** or **Logs** tab
6. Check for any build or runtime errors

---

## Step 8: Complete Feature Test

### Test Checklist

- [ ] **Frontend loads** without errors
- [ ] **Backend health check** works: `/health`
- [ ] **OTP login** works (use `123456` as OTP)
- [ ] **KYC upload** works (if configured)
- [ ] **Wallet connection** works
- [ ] **Transaction creation** works
- [ ] **No CORS errors** in browser console
- [ ] **No API errors** in browser console

### Manual Testing Flow

1. ✅ Visit frontend: `https://your-project.vercel.app`
2. ✅ Click "Verify Phone Number"
3. ✅ Enter any phone number
4. ✅ Enter OTP: `123456`
5. ✅ Should login successfully
6. ✅ Connect wallet (MetaMask)
7. ✅ Try creating a transaction
8. ✅ Check browser console for errors

---

## Troubleshooting

### Problem: Backend returns 404 or doesn't respond

**Solution:**
1. Check backend is running in Render dashboard
2. Verify backend URL is correct
3. Test health endpoint directly in browser

### Problem: CORS errors in browser

**Symptoms:**
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

**Solution:**
1. Go to Render dashboard → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app
   ```
3. Remove trailing slashes
4. Save and wait for restart (2-3 minutes)
5. Clear browser cache
6. Test again

### Problem: Frontend shows "API URL not configured"

**Solution:**
1. Go to Vercel dashboard → Settings → Environment Variables
2. Verify `VITE_API_URL` exists and is correct
3. Redeploy frontend (after adding/changing variables)

### Problem: API calls fail with 500 error

**Solution:**
1. Check Render backend logs
2. Verify Supabase credentials are correct
3. Verify JWT_SECRET is set
4. Check database connection

### Problem: Frontend can't connect to backend

**Checklist:**
- [ ] Backend URL in `VITE_API_URL` is correct (HTTPS, no trailing slash)
- [ ] Backend is running (test `/health` endpoint)
- [ ] `ALLOWED_ORIGINS` includes frontend URL
- [ ] No firewall blocking requests
- [ ] Both services are deployed (not paused)

### Problem: WebSocket connection error (ws://localhost:5000)

**Symptoms:**
```
WebSocket connection to 'ws://localhost:5000/socket.io/' failed
```

**Solution:**
👉 **See [FIX-WEBSOCKET-ERROR.md](./FIX-WEBSOCKET-ERROR.md) for detailed fix**

Quick fix:
1. Set `VITE_API_URL` in Vercel environment variables
2. Redeploy frontend (required after setting env vars)
3. Clear browser cache

---

## Quick Verification Script

You can test everything at once using this JavaScript in browser console:

```javascript
// Replace with your actual URLs
const BACKEND_URL = 'https://your-backend.onrender.com';
const FRONTEND_URL = window.location.origin;

console.log('🔍 Starting Verification...\n');

// Test 1: Check environment variable
console.log('1️⃣ Frontend API URL:', import.meta.env.VITE_API_URL);

// Test 2: Backend health
fetch(`${BACKEND_URL}/health`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend Health:', data);
    
    // Test 3: CORS
    return fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Origin': FRONTEND_URL }
    });
  })
  .then(r => {
    if (r.ok) {
      console.log('✅ CORS is working');
    } else {
      console.error('❌ CORS issue:', r.status);
    }
    
    // Test 4: API endpoint
    return fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ API Endpoint Works:', data);
    console.log('\n🎉 All checks passed!');
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
```

---

## Summary: Quick Verification Checklist

### ✅ Backend (Render)
- [ ] Health endpoint works: `https://your-backend.onrender.com/health`
- [ ] Environment variables set correctly
- [ ] `ALLOWED_ORIGINS` includes frontend URL
- [ ] Service is running (not paused)

### ✅ Frontend (Vercel)
- [ ] Deployed successfully
- [ ] `VITE_API_URL` set to backend URL
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set
- [ ] No build errors

### ✅ Connection
- [ ] No CORS errors in browser console
- [ ] API calls succeed from frontend
- [ ] OTP login works
- [ ] Features work end-to-end

---

## Need Help?

If verification fails:
1. Check backend logs in Render
2. Check frontend logs in Vercel
3. Check browser console for errors
4. Verify environment variables match exactly
5. Ensure both services are deployed and running

**Success Indicators:**
- ✅ Health endpoint returns OK
- ✅ No CORS errors in console
- ✅ API calls succeed
- ✅ Features work as expected

🎉 **Your deployment is verified when all checks pass!**

