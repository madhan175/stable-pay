# Fix 502 Bad Gateway Error on Render

If you're seeing a **502 Bad Gateway** error when accessing your backend:
```
https://stable-pay-mkkj.onrender.com/health
```

This means Render can't connect to your Node.js server. Here's how to fix it.

## Common Causes

1. **Server not starting properly** (missing env vars, startup errors)
2. **Server crashing after startup** (unhandled errors)
3. **Free tier spin-down** (service went to sleep)
4. **Wrong port configuration**

## Quick Fix Steps

### Step 1: Check Render Logs

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open your backend service (`stable-pay`)
3. Go to **Logs** tab
4. Scroll down to see the **latest logs**

**Look for:**
- ✅ `🚀 Server running on port 10000` (or whatever port)
- ❌ Error messages
- ❌ "Process exited with code 1"
- ❌ Missing environment variable errors

### Step 2: Verify Required Environment Variables

Go to **Environment** tab and ensure these are set:

**Required:**
```bash
PORT=5000
NODE_ENV=production

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

JWT_SECRET=your-random-32-character-secret
```

**Important for CORS:**
```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Note:** Render automatically sets `PORT` for you, but you can also set it manually. However, **don't set PORT to 5000** - Render assigns a random port. The server code should use `process.env.PORT` (which it does).

### Step 3: Check for Startup Errors

In the logs, look for:
- Database connection errors
- Missing module errors
- Environment variable errors

### Step 4: Restart the Service

1. Go to **Manual Deploy** dropdown
2. Click **Clear build cache & deploy**
3. Wait for deployment (5-10 minutes)

## Detailed Troubleshooting

### Problem 1: Server Not Starting

**Symptoms:**
- Logs show `node server.js` but no "Server running" message
- Service shows "Live" but returns 502

**Check:**
1. **Scroll down in logs** - might be cut off
2. Look for error messages after `node server.js`
3. Check if Supabase connection is failing

**Solution:**
```javascript
// Add error handling at startup (already in server.js, but verify)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
```

### Problem 2: Missing Environment Variables

**Symptoms:**
- Logs show errors about undefined variables
- Server crashes on startup

**Solution:**
1. Verify all required variables in **Environment** tab
2. Make sure variable names match exactly (case-sensitive)
3. No typos in values
4. Restart service after adding variables

### Problem 3: Free Tier Spin-Down

**Symptoms:**
- Service shows "Live" but requests timeout
- First request after inactivity takes 50+ seconds

**Solution:**
- This is normal for free tier
- Wait 50-60 seconds for first request to wake it up
- Or upgrade to paid plan for always-on service

### Problem 4: Database Connection Failing

**Symptoms:**
- Logs show Supabase connection errors
- Server starts but crashes when database is accessed

**Solution:**
1. Verify Supabase credentials:
   - Go to Supabase dashboard
   - Settings → API
   - Copy correct values
2. Check Supabase project is not paused
3. Verify network allows connections

### Problem 5: Port Configuration Issue

**Symptoms:**
- Server logs show wrong port
- Render can't connect

**Solution:**
Render automatically assigns `PORT` environment variable. Your code should use:
```javascript
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Don't hardcode port 5000** - use `process.env.PORT` (which you're already doing ✅)

## Step-by-Step Debugging

### 1. Check Full Logs

1. In Render dashboard, go to **Logs**
2. Scroll all the way down
3. Look for:
   - `🚀 Server running on port X`
   - Any error messages
   - Exit codes

### 2. Test Health Endpoint Locally (If Possible)

If you can test locally, verify server starts:
```bash
cd backend
npm install
npm start
```

Then visit: `http://localhost:5000/health`

### 3. Add More Logging

If needed, add logging to see what's happening:

```javascript
console.log('📦 Starting server...');
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔑 Supabase URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const PORT = process.env.PORT || 5000;
console.log(`🌐 Attempting to listen on port ${PORT}`);

server.listen(PORT, () => {
  console.log(`✅ Server successfully running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});
```

### 4. Verify Service is Actually Running

1. Go to Render dashboard
2. Check service status:
   - ✅ **Live** (green) = should be working
   - ⚠️ **Building** = still deploying
   - ❌ **Failed** = check logs

### 5. Test Health Endpoint

After deployment, test:
```bash
curl https://stable-pay-mkkj.onrender.com/health
```

Or visit in browser:
```
https://stable-pay-mkkj.onrender.com/health
```

## Environment Variables Checklist

Make sure these are set in Render **Environment** tab:

- [ ] `NODE_ENV=production`
- [ ] `SUPABASE_URL` (your Supabase project URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (service role key)
- [ ] `SUPABASE_ANON_KEY` (anon key)
- [ ] `JWT_SECRET` (random 32+ character string)
- [ ] `ALLOWED_ORIGINS` (your frontend URL, comma-separated if multiple)
- [ ] `PORT` (optional - Render sets this automatically)

**Optional but recommended:**
- [ ] `FRONTEND_URL` (your Vercel frontend URL)
- [ ] `ETHEREUM_RPC_URL` (if using blockchain features)
- [ ] `CONTRACT_ADDRESS` (if using smart contracts)

## Quick Test Commands

**Test from command line:**
```bash
# Test health endpoint
curl https://stable-pay-mkkj.onrender.com/health

# Test with verbose output
curl -v https://stable-pay-mkkj.onrender.com/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-01T..."
}
```

## Still Not Working?

### Check These:

1. **Service Status**
   - Is service marked as "Live"?
   - Any deployment errors?

2. **Build Logs**
   - Did `npm install` succeed?
   - Any build errors?

3. **Runtime Logs**
   - Did server start?
   - Any runtime errors?

4. **Network Issues**
   - Can you access Render dashboard?
   - Any firewall blocking?

5. **Service Limits**
   - Free tier limits reached?
   - Service suspended?

### Get More Help

1. **Check Render Documentation**
   - [Render Troubleshooting](https://render.com/docs/troubleshooting)
   - [Render Support](https://render.com/docs/support)

2. **Share Logs**
   - Copy full error messages
   - Share relevant log sections
   - Include environment variable names (not values!)

3. **Common Solutions**
   - Clear build cache and redeploy
   - Check service is not paused
   - Verify all required env vars are set
   - Ensure Node.js version is compatible (18+)

## Prevention

To avoid 502 errors in future:

1. ✅ Always set required environment variables before first deploy
2. ✅ Test health endpoint after deployment
3. ✅ Monitor logs regularly
4. ✅ Handle errors gracefully in code
5. ✅ Use error logging (consider Sentry or similar)

---

**Quick Checklist:**

- [ ] Check Render logs for errors
- [ ] Verify all environment variables are set
- [ ] Service status is "Live"
- [ ] Health endpoint returns JSON response
- [ ] No uncaught exceptions in logs
- [ ] Database connection working
- [ ] Port configuration correct

Once all checked, your service should work! 🎉

