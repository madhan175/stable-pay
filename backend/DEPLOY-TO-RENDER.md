# 🚀 Deploy Backend to Render - Step by Step Guide

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
2. **GitHub Repository**: Your code pushed to GitHub
3. **Environment Variables**: All secrets ready (see below)

## 🎯 Quick Deployment Steps

### Step 1: Prepare Your Repository

Ensure your backend code is in the `backend/` folder and committed to GitHub.

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign in or create account

2. **Create New Web Service**
   - Click **"New +"** button
   - Select **"Web Service"**

3. **Connect GitHub Repository**
   - Connect your GitHub account (if not already)
   - Select your repository: `StablePay2.0`
   - Choose branch: `main` (or your deployment branch)

4. **Configure Service Settings**

   **Basic Information:**
   ```
   Name: stablepay-backend
   Region: Choose closest to your users (e.g., Singapore, US East)
   Branch: main
   Root Directory: backend
   ```

   **Build & Deploy:**
   ```
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

   **Plan:**
   - Free Tier (limited hours) OR
   - Starter ($7/month) - recommended for production

### Step 3: Set Environment Variables

Click on **"Environment"** tab and add these variables:

#### Required Variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
# OR if using Vercel: https://your-app.vercel.app

# Supabase (Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Twilio (for SMS OTP - Optional if not using SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# OCR (Tesseract.js - no keys needed, but can configure)
# Tesseract.js works without any API keys

# Redis (Optional - for OTP storage)
# If using Redis on Render, add:
REDIS_URL=redis://your-redis-host:6379

# CoinGecko API (Optional - for currency conversion)
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Contract Addresses (Optional)
CONTRACT_ADDRESS=0x39d886A94568EaDa1e08e4005186F3fff2eE84f9
USDT_ADDRESS=0x1234567890123456789012345678901234567890
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ADMIN_PRIVATE_KEY=your-admin-private-key-for-backend-contract-operations
```

#### How to Get Values:

1. **Supabase Credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create/select your project
   - Go to Settings → API
   - Copy URL, anon key, and service role key

2. **JWT Secret:**
   ```bash
   # Generate a secure secret:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Frontend URL:**
   - After deploying frontend to Vercel
   - Use your Vercel deployment URL

4. **Twilio (Optional):**
   - Sign up at [twilio.com](https://twilio.com)
   - Get Account SID and Auth Token
   - Add phone number

### Step 4: Configure Health Check

Render will automatically check `/health` endpoint (already configured in your server.js).

**Health Check Settings:**
- Path: `/health`
- Render will monitor this automatically

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Install dependencies (`npm install`)
   - Start your service (`npm start`)
   - Provide a URL like: `https://stablepay-backend.onrender.com`

### Step 6: Verify Deployment

1. **Check Service Status**
   - Should show "Live" status
   - Green indicator means it's running

2. **Test Health Endpoint**
   ```bash
   curl https://stablepay-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Check Logs**
   - Go to "Logs" tab
   - Verify no errors
   - Should see: `🚀 Server running on port 5000`

## 🔧 Important Configuration Notes

### 1. CORS Configuration

Your `server.js` already handles CORS. Make sure `FRONTEND_URL` includes:
- Your Vercel frontend URL
- Any custom domains you use

### 2. File Storage

Render has **ephemeral storage** (files are deleted on restart). Options:

**Option A: Use Supabase Storage** (Recommended)
- Upload documents directly to Supabase Storage
- Update code to use Supabase Storage API

**Option B: Use External Storage**
- AWS S3, Cloudinary, etc.
- Add credentials to environment variables

### 3. Redis (Optional)

If you need Redis for OTP storage:
1. Create Redis instance on Render
2. Add `REDIS_URL` to environment variables
3. Or use Supabase for storage (simpler)

### 4. Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project

2. **Run Database Schema**
   - Go to Supabase SQL Editor
   - Run `database/setup-supabase.sql`
   - Or import `database/supabase-schema.sql`

3. **Set Environment Variables**
   - Add Supabase credentials to Render

## 🚨 Common Issues & Solutions

### Issue 1: Service Won't Start

**Error**: `EADDRINUSE` or port issues
**Solution**: 
- Render sets PORT automatically - don't hardcode it
- Your code already uses `process.env.PORT || 5000` ✅

### Issue 2: Build Fails

**Error**: `npm install` fails
**Solution**:
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

### Issue 3: Environment Variables Not Working

**Error**: Variables are undefined
**Solution**:
- Restart service after adding variables
- Check variable names match exactly (case-sensitive)
- No quotes needed in Render dashboard

### Issue 4: CORS Errors

**Error**: Frontend can't connect
**Solution**:
- Verify `FRONTEND_URL` is set correctly
- Include full URL: `https://your-app.vercel.app`
- Check server logs for CORS errors

### Issue 5: Database Connection Fails

**Error**: Can't connect to Supabase
**Solution**:
- Verify Supabase credentials
- Check network access (Supabase allows all IPs by default)
- Test connection from Supabase dashboard

## 📊 Post-Deployment Checklist

- [ ] Service shows "Live" status
- [ ] Health check returns 200 OK
- [ ] Logs show server running without errors
- [ ] Frontend can connect to backend
- [ ] Environment variables are set correctly
- [ ] Database connection works
- [ ] CORS configured for frontend domain
- [ ] Test a few API endpoints

## 🔗 Connect Frontend

After backend is deployed:

1. **Update Frontend Environment Variable**
   ```env
   VITE_API_URL=https://stablepay-backend.onrender.com
   ```

2. **Redeploy Frontend**
   - Commit the change
   - Vercel will auto-deploy

## 💰 Render Pricing

- **Free Tier**: 
  - 750 hours/month
  - Services spin down after 15 min inactivity
  - Good for development/testing

- **Starter Plan ($7/month)**:
  - Always-on service
  - Better for production
  - No spin-down

- **Professional ($25/month)**:
  - Auto-scaling
  - Better performance
  - For high traffic

## 🔄 Auto-Deploy

Render auto-deploys on:
- Push to selected branch (default: `main`)
- Manual deploy available in dashboard

**To disable auto-deploy:**
- Go to Settings → Build & Deploy
- Toggle "Auto-Deploy" off

## 📝 Render Service Configuration Summary

```
Service Name: stablepay-backend
Environment: Node
Region: [Choose closest to users]
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /health
Plan: Starter ($7/month) or Free
```

## 🎯 Quick Command Reference

```bash
# Check if service is running
curl https://stablepay-backend.onrender.com/health

# View logs (in Render dashboard)
# Go to: Logs tab

# Restart service
# Go to: Manual Deploy → Clear build cache & deploy

# Update environment variables
# Go to: Environment tab → Add/Edit → Save Changes
# Service will auto-restart
```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node)
- [Environment Variables Guide](https://render.com/docs/environment-variables)
- [Health Checks Guide](https://render.com/docs/health-checks)

---

**Your backend is now ready to deploy! 🚀**

After deployment, your backend URL will be:
`https://stablepay-backend.onrender.com`

Update your frontend's `VITE_API_URL` to this URL and you're good to go!

