# 🔧 Fix Vercel Environment Variables

The WebSocket connection error is because `VITE_API_URL` is not set in Vercel.

## ⚠️ Error You're Seeing

```
⚠️ [SOCKET] Make sure VITE_API_URL is set in Vercel environment variables
WebSocket connection to 'wss://stable-pay-mkkj.onrender.com/socket.io/...' failed
```

## ✅ Solution: Set VITE_API_URL in Vercel

### Step 1: Get Your Backend URL

Your backend should be deployed on Render. Find your backend URL:
- Format: `https://your-backend-name.onrender.com`
- Example: `https://stablepay-backend.onrender.com`

### Step 2: Add Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Navigate to Your Project**
   - Find and click on: **stable-pay-2.1**

3. **Go to Settings**
   - Click **"Settings"** tab (top navigation)
   - Click **"Environment Variables"** (left sidebar)

4. **Add New Variable**
   - Click **"Add New"** button
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (replace with your actual backend URL)
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just Production if you only want it for production)
   - Click **"Save"**

5. **Redeploy**
   - After adding the variable, go to **"Deployments"** tab
   - Find the latest deployment
   - Click the **"..."** menu → **"Redeploy"**
   - Or push a new commit to trigger automatic redeploy

### Step 3: Verify It Works

After redeploying, check:
1. Open your app: `https://stable-pay-21.vercel.app`
2. Open browser console (F12)
3. You should see:
   ```
   🔗 [API] Base URL: https://your-backend-url.onrender.com
   🔌 [SOCKET] Connecting to: https://your-backend-url.onrender.com
   ```

## 📋 Complete Environment Variables Checklist

Make sure these are set in Vercel:

### Required Variables

```env
VITE_API_URL=https://your-backend.onrender.com
```

### Optional (but Recommended)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CONTRACT_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
```

## 🔍 Verify Backend is Running

Before setting `VITE_API_URL`, make sure your backend is:
1. ✅ Deployed on Render
2. ✅ Running and accessible
3. ✅ CORS configured to allow your Vercel URL

To test backend:
```bash
curl https://your-backend.onrender.com/health
```

## 🚨 Common Issues

### Issue 1: Variable Not Working After Adding

**Solution**: 
- Redeploy your Vercel app (variables only take effect on new deployments)
- Make sure variable name starts with `VITE_` (required for Vite to expose it)
- Check you selected the correct environment (Production/Preview/Development)

### Issue 2: Backend Not Allowing CORS

**Solution**: In your Render backend, add environment variable:
```
ALLOWED_ORIGINS=https://stable-pay-21.vercel.app
```

Then restart the backend service.

### Issue 3: WebSocket Still Failing

**Check:**
1. Backend URL is correct and accessible
2. Backend supports WebSocket connections
3. No firewall blocking WebSocket connections
4. Backend CORS allows your Vercel domain

## 📸 Quick Visual Guide

1. **Vercel Dashboard** → Your Project → **Settings**
2. **Environment Variables** (left sidebar)
3. **Add New** → Key: `VITE_API_URL`, Value: `https://your-backend.onrender.com`
4. **Save** → **Redeploy**

## ⚡ Quick Command (Alternative)

If you have Vercel CLI installed:

```bash
cd frontend
vercel env add VITE_API_URL production
# Enter your backend URL when prompted
```

Then redeploy:
```bash
vercel --prod
```

---

**After setting `VITE_API_URL` and redeploying, the WebSocket errors should disappear!**

