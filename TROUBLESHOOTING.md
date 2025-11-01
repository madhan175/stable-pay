# 🔧 Troubleshooting Guide

Quick solutions for common StablePay issues.

## 📋 Quick Navigation

- [Connection Issues](#connection-issues)
- [WebSocket Errors](#websocket-errors)
- [CORS Errors](#cors-errors)
- [Environment Variables](#environment-variables)
- [Deployment Issues](#deployment-issues)
- [Quick Tests](#quick-tests)

---

## Connection Issues

### Problem: Backend Not Connecting

**Symptoms:**
- Errors in browser console
- API calls failing
- "Backend offline" messages

**Quick Test:**
```javascript
// Paste in browser console
fetch('https://stable-pay-mkkj.onrender.com/health')
  .then(r=>r.json())
  .then(d=>console.log('✅ Backend:',d))
  .catch(e=>console.log('❌ Backend:',e))
```

**Solutions:**

1. **Check Backend Status**
   - Visit: https://dashboard.render.com
   - Service should show "Live"
   - Check logs for errors

2. **Verify Environment Variables**
   - Vercel → Settings → Environment Variables
   - `VITE_API_URL` should be: `https://stable-pay-mkkj.onrender.com`
   - **Must redeploy** after adding/updating

3. **Test Backend Directly**
   ```bash
   # Windows PowerShell
   Invoke-WebRequest -Uri https://stable-pay-mkkj.onrender.com/health
   
   # Mac/Linux
   curl https://stable-pay-mkkj.onrender.com/health
   ```

---

## WebSocket Errors

### Problem: WebSocket Connection Failed

**Error:**
```
WebSocket connection to 'wss://stable-pay-mkkj.onrender.com/socket.io/' failed
```

**Root Cause:** Render free tier spins down after 15 minutes

**✅ Fixed!** (Already implemented in `socketService.ts`)

**How It's Fixed:**
- Auto-detects Render free tier
- Uses polling-first mode
- Better retry logic

**Verify Fix Works:**
```javascript
// Browser console - should see:
// 🔧 [SOCKET] Detected Render deployment - using polling-first mode
// 🔗 [SOCKET] Connected to KYC socket server
```

**If Still Failing:**
1. Check backend is deployed: https://dashboard.render.com
2. Verify environment variable: `VITE_API_URL` set in Vercel
3. Redeploy frontend: Push new commit or manual redeploy
4. Clear cache: Ctrl+Shift+R in browser

**Optional Upgrade:**
- Consider Render Starter ($7/month) for always-on service

---

## CORS Errors

### Problem: CORS Policy Blocking Requests

**Error:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solution:**

1. **Set ALLOWED_ORIGINS in Render**
   ```
   ALLOWED_ORIGINS=https://stable-pay-21.vercel.app
   ```

2. **Add All Domains**
   - Include production URL
   - Include preview URLs if needed
   - Comma-separated, no trailing slashes

3. **Restart Backend**
   - Render Dashboard → Manual Deploy → Redeploy

4. **Verify**
   ```bash
   # Should return 200
   curl https://stable-pay-mkkj.onrender.com/health
   ```

---

## Environment Variables

### Required Variables

**Vercel (Frontend):**
```env
VITE_API_URL=https://stable-pay-mkkj.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Render (Backend):**
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://stable-pay-21.vercel.app
```

### Common Issues

**Issue:** "VITE_API_URL not set"
- Fix: Set in Vercel → Settings → Environment Variables
- Then: **Redeploy**

**Issue:** "Still using localhost after setting variable"
- Fix: Variables only apply to NEW deployments
- Action: Redeploy frontend

**Issue:** "Backend not allowing CORS"
- Fix: Add ALLOWED_ORIGINS in Render
- Then: Restart backend service

---

## Deployment Issues

### Problem: Frontend Not Updating

**Solutions:**
1. Check Vercel deployment status
2. Wait 2-5 minutes for auto-deploy
3. Manually trigger redeploy
4. Clear browser cache: Ctrl+Shift+R

### Problem: Backend Spin-Down (Render Free)

**Symptoms:**
- Works sometimes, fails other times
- 10-30 second delays on first request
- WebSocket disconnections

**Solutions:**
1. ✅ Already fixed with polling-first mode
2. Or upgrade to Render Starter ($7/month)

### Problem: Build Fails

**Check:**
1. Build logs in deployment dashboard
2. Environment variables set correctly
3. Node.js version matches (18+)
4. All dependencies in package.json

---

## Quick Tests

### Test 1: Backend Health (30 seconds)

```javascript
// Browser console
fetch('https://stable-pay-mkkj.onrender.com/health')
  .then(r=>r.json())
  .then(d=>console.log('✅',d))
  .catch(e=>console.log('❌',e))
```

### Test 2: Connection Status (1 minute)

```javascript
(async()=>{
  const b='https://stable-pay-mkkj.onrender.com';
  try{
    const d=await fetch(`${b}/health`).then(r=>r.json());
    console.log('✅ Backend:',d.status);
  }catch(e){console.log('❌ Backend:',e.message)}
  const u=import.meta.env.VITE_API_URL;
  console.log(u?'✅ URL set':'❌ URL missing');
})();
```

### Test 3: Environment Check (Browser Console)

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Mode:', import.meta.env.MODE);
```

### Test 4: WebSocket Check

Open browser console, look for:
```
✅ 🔗 [SOCKET] Connected to KYC socket server
❌ ⚠️ [SOCKET] Connection error
```

---

## Still Need Help?

1. **Check Logs**
   - Render: Dashboard → Logs
   - Vercel: Deployments → Build Logs

2. **Use Test Tool**
   - Open: `test-connection.html` in browser
   - Click: "Run All Tests"

3. **Review Documentation**
   - `DEPLOYMENT.md` - Full deployment guide
   - `backend/DEPLOY-TO-RENDER.md` - Backend setup
   - `frontend/VERCEL-DEPLOYMENT.md` - Frontend setup

4. **Common Commands**
   ```bash
   # Test backend
   curl https://stable-pay-mkkj.onrender.com/health
   
   # Check git status
   git status
   
   # Redeploy
   git add . && git commit -m "Update" && git push
   ```

---

**Most issues are solved by:**
1. Setting environment variables correctly
2. Redeploying after changes
3. Clearing browser cache
4. Checking service status in dashboards

**Need more?** Check Render and Vercel documentation or contact support.

