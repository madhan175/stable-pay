# Quick Deployment Steps

Follow these steps to deploy StablePay 2.0 to production.

## Prerequisites Checklist

- [ ] GitHub account and repository pushed
- [ ] Render account created ([render.com](https://render.com))
- [ ] Vercel account created ([vercel.com](https://vercel.com))
- [ ] Supabase project created ([supabase.com](https://supabase.com))

## Step 1: Set Up Supabase Database

**⏱️ Time: 10 minutes**

1. Create Supabase project
2. Go to SQL Editor
3. Run `backend/database/setup-supabase.sql`
4. Save your credentials:
   - Project URL
   - Service Role Key
   - Anon Key

## Step 2: Deploy Backend to Render

**⏱️ Time: 15 minutes**

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `stablepay-backend`
   - **Region**: Singapore (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.2 Add Environment Variables

**Required Variables:**

```bash
# Server
PORT=5000
NODE_ENV=production

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Security
JWT_SECRET=generate-random-32-char-string

# CORS (will update later with frontend URL)
ALLOWED_ORIGINS=https://localhost:5173
```

**Optional Variables:**

```bash
# Blockchain
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
ADMIN_PRIVATE_KEY=0x...your-admin-private-key
CONTRACT_ADDRESS=0xA59CE17F2ea6946F48386B4bD7884512AeC674F4
USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD

# CoinGecko
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Get your backend URL: `https://stablepay-backend.onrender.com`
4. Test: Visit `https://stablepay-backend.onrender.com/health`

### 2.4 Verify Deployment

```bash
curl https://stablepay-backend.onrender.com/health
```

Should return: `{"status":"OK","timestamp":"..."}`

✅ **Backend deployed!**

## Step 3: Deploy Frontend to Vercel

**⏱️ Time: 10 minutes**

### 3.1 Create Project

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

**Note**: The `vercel.json` file in your repo automatically configures headers for PWA support.

### 3.2 Add Environment Variables

**Required Variables:**

```bash
# Backend API
VITE_API_URL=https://stablepay-backend.onrender.com

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Optional Variables:**

```bash
# Contracts
VITE_CONTRACT_ADDRESS=0xA59CE17F2ea6946F48386B4bD7884512AeC674F4
VITE_USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD
```

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Get your frontend URL: `https://your-project.vercel.app`

✅ **Frontend deployed!**

## Step 4: Connect Frontend to Backend

**⏱️ Time: 5 minutes**

### 4.1 Update Backend CORS

1. Go back to Render dashboard
2. Edit environment variables
3. Update `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://your-project.vercel.app
```

4. Save changes
5. Service will auto-restart

### 4.2 Test Connection

1. Visit your Vercel URL
2. Try logging in with OTP
3. Check browser console for errors
4. Test KYC upload if configured

✅ **Connection working!**

## Step 5: Verify Everything Works

**⏱️ Time: 15 minutes**

👉 **Detailed Verification Guide**: See [VERIFY-DEPLOYMENT.md](./VERIFY-DEPLOYMENT.md) for complete verification steps

### 5.1 Quick Verification

**Option 1: Use Test Page**
1. Download `test-connection.html` from project root
2. Open it in browser
3. Enter your backend and frontend URLs
4. Click "Run All Tests"
5. Review results

**Option 2: Browser Console Test**
1. Visit your Vercel frontend
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `import.meta.env.VITE_API_URL`
5. Should show your backend URL
6. Test API: 
```javascript
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('✅ Connected:', data))
```

### 5.2 Test Checklist

- [ ] Backend health endpoint works: `/health`
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] OTP login works (use `123456` as OTP)
- [ ] KYC upload works
- [ ] Transaction creation works
- [ ] Database operations work
- [ ] PWA features work (service worker, install prompt)
- [ ] Mobile-responsive design works correctly

### 5.3 Common Issues

**CORS Error:**
```
Solution: Check ALLOWED_ORIGINS matches frontend URL exactly
```

**API Not Found:**
```
Solution: Verify VITE_API_URL is correct backend URL
```

**Database Error:**
```
Solution: Check Supabase credentials are correct
```

**Build Fails:**
```
Solution: Check build logs, verify environment variables
```

## Step 6: Configure Custom Domain (Optional)

**⏱️ Time: 10 minutes**

### 6.1 Vercel

1. Go to project settings → **"Domains"**
2. Add your domain
3. Follow DNS configuration steps
4. Update `ALLOWED_ORIGINS` in Render with new domain

### 6.2 Render

1. Go to service settings → **"Custom Domain"**
2. Add domain
3. Configure DNS as instructed

## Post-Deployment

### Enable Monitoring

**Render:**
- View logs in dashboard
- Set up alerts for crashes

**Vercel:**
- Enable Analytics
- Monitor performance

### Security Hardening

- [ ] Generate strong JWT secret
- [ ] Review CORS configuration
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups

### Backup Strategy

**Supabase:**
- Automatic daily backups included
- Export database regularly

**Code:**
- Version control in GitHub
- Tag releases

## Troubleshooting

### Backend won't start

```
Check:
1. Environment variables are set correctly
2. Build logs for errors
3. PORT is set to 5000
4. Node version is 18+
```

### Frontend build fails

```
Check:
1. Root directory is set to "frontend"
2. Environment variables start with VITE_
3. All dependencies installed
4. No syntax errors
```

### CORS still failing

```
Check:
1. ALLOWED_ORIGINS URL is exact match
2. No trailing slashes
3. HTTPS (not HTTP)
4. Backend restarted after changes
```

### Database connection fails

```
Check:
1. Supabase URL format correct
2. Service role key is valid
3. Project is not paused
4. Network firewall allows connection
```

## Quick Command Reference

**Test backend health:**
```bash
curl https://your-backend.onrender.com/health
```

**Test frontend:**
```bash
# Just visit: https://your-frontend.vercel.app
```

**View backend logs:**
```bash
# In Render dashboard → Logs tab
```

**View frontend logs:**
```bash
# In Vercel dashboard → Deployment → Functions
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Support Resources

- **Backend Issues**: [backend/RENDER-DEPLOYMENT.md](backend/RENDER-DEPLOYMENT.md)
- **Frontend Issues**: [frontend/VERCEL-DEPLOYMENT.md](frontend/VERCEL-DEPLOYMENT.md)
- **Environment Variables**: [DEPLOYMENT-ENV-VARS.md](DEPLOYMENT-ENV-VARS.md)
- **Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

## Cost Estimate

**Minimum Monthly Cost:**

- **Render**: $7/month (Starter plan)
- **Vercel**: $0 (Hobby plan)
- **Supabase**: $0 (Free tier)

**Total**: ~$7/month

**Production Recommended:**

- **Render**: $25/month (Professional)
- **Vercel**: $20/month (Pro)
- **Supabase**: $25/month (Pro)

**Total**: ~$70/month

## Next Steps

1. ✅ Monitor for errors
2. ✅ Set up error tracking (Sentry, etc.)
3. ✅ Configure analytics
4. ✅ Set up CI/CD if needed
5. ✅ Document API endpoints
6. ✅ Create user documentation

## Deployment URLs Template

Update these with your actual URLs:

```
Backend:  https://stablepay-backend.onrender.com
Frontend: https://your-project.vercel.app
Supabase: https://your-project.supabase.co

Health Check: https://stablepay-backend.onrender.com/health
API Docs:     (If you create them)
```

## Success! 🎉

Your StablePay 2.0 app is now live in production!

**Share your deployment URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://stablepay-backend.onrender.com`

Remember to:
- Monitor logs regularly
- Keep dependencies updated
- Backup database regularly
- Test new deployments in staging first

Good luck! 🚀

