# Environment Variables Reference

Complete list of all environment variables needed for backend (Render) and frontend (Vercel) deployment.

## Backend Environment Variables (Render)

### Required Variables

```bash
# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=production

# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ============================================
# Authentication
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# ============================================
# CORS Configuration
# ============================================
# Comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com

# Optional: Legacy CORS support
FRONTEND_URL=https://your-frontend.vercel.app
```

### Optional Variables

```bash
# ============================================
# Twilio OTP (If using real SMS)
# ============================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Note: Current implementation uses fake OTP (no SMS sent)
# OTP "123456" always works for testing

# ============================================
# Redis (For production OTP storage)
# ============================================
REDIS_URL=redis://localhost:6379
# Or for hosted Redis (e.g., Upstash):
# REDIS_URL=rediss://your-redis-url

# ============================================
# Google Cloud Vision (Optional OCR alternative)
# ============================================
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
# OR separate credentials
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Note: Current implementation uses Tesseract.js (FREE, no API keys needed)

# ============================================
# Blockchain/Ethereum Configuration
# ============================================
# Ethereum RPC URL (Infura, Alchemy, etc.)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
# OR for Sepolia testnet:
# ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Admin private key (for smart contract operations)
ADMIN_PRIVATE_KEY=0x1234567890abcdef...

# Smart contract addresses
CONTRACT_ADDRESS=0xA59CE17F2ea6946F48386B4bD7884512AeC674F4
USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD

# ============================================
# CoinGecko API (Currency conversion)
# ============================================
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# ============================================
# File Upload Configuration
# ============================================
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Logging
# ============================================
LOG_LEVEL=info  # options: debug, info, warn, error
```

## Frontend Environment Variables (Vercel)

### Required Variables

```bash
# ============================================
# Backend API Configuration
# ============================================
VITE_API_URL=https://your-backend.onrender.com
# Example: https://stablepay-backend.onrender.com

# ============================================
# Supabase Configuration
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional Variables

```bash
# ============================================
# Smart Contract Addresses
# ============================================
VITE_CONTRACT_ADDRESS=0xA59CE17F2ea6946F48386B4bD7884512AeC674F4
VITE_USDT_ADDRESS=0x61Ddf50869436D159090bBAC40f0fe7e4Ffcd4cD

# ============================================
# Blockchain Network
# ============================================
# Vite doesn't expose this by default, but can be added if needed
# VITE_CHAIN_ID=11155111  # Sepolia testnet
# VITE_CHAIN_ID=1  # Ethereum mainnet
```

## Getting Your Values

### Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL` or `VITE_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

### JWT Secret

Generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Or use online generator
# https://randomkeygen.com/
```

### Ethereum RPC URL

**Free Options:**

1. **Alchemy** (Recommended)
   - Sign up at [alchemy.com](https://alchemy.com)
   - Create app
   - Copy HTTP URL
   - Format: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

2. **Infura**
   - Sign up at [infura.io](https://infura.io)
   - Create project
   - Copy endpoint URL
   - Format: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

3. **Public RPC** (Slower, less reliable)
   - `https://eth.llamarpc.com`
   - `https://rpc.ankr.com/eth`

**Admin Private Key:**

⚠️ **SECURITY WARNING**: This is sensitive!
- Generate a new wallet for admin operations
- Keep private key secure
- Don't use your main wallet's private key
- Use a separate wallet with minimal funds

```bash
# Generate new private key using ethers.js
node -e "const { ethers } = require('ethers'); console.log(ethers.Wallet.createRandom().privateKey);"
```

### Twilio Credentials (Optional)

1. Sign up at [twilio.com](https://twilio.com)
2. Get credentials from dashboard:
   - **Account SID**
   - **Auth Token**
   - **Phone Number**

## Environment-Specific Configuration

### Development

```bash
# Backend (.env in backend folder)
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Frontend (.env in frontend folder)
VITE_API_URL=http://localhost:5000
```

### Production (Render + Vercel)

```bash
# Backend (Render Dashboard)
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Frontend (Vercel Dashboard)
VITE_API_URL=https://your-backend.onrender.com
```

### Staging (Optional)

```bash
# Backend
ALLOWED_ORIGINS=https://staging-your-frontend.vercel.app,https://your-frontend.vercel.app

# Frontend
VITE_API_URL=https://staging-your-backend.onrender.com
```

## Setting Variables in Render

1. Go to Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add each variable:
   - **Key**: Variable name
   - **Value**: Variable value
   - Click **Save Changes**
5. Service will auto-restart

## Setting Variables in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: Variable name (must start with `VITE_`)
   - **Value**: Variable value
   - **Environment**: Select (Production, Preview, Development)
5. Click **Save**
6. Redeploy to apply

## Testing Your Configuration

### Backend

```bash
# Check health endpoint
curl https://your-backend.onrender.com/health

# Should return:
# {"status":"OK","timestamp":"..."}
```

### Frontend

```bash
# Check if API URL is configured
# Open browser console on your Vercel deployment
# Type: import.meta.env.VITE_API_URL
# Should show your backend URL
```

## Security Best Practices

1. ✅ **Never commit `.env` files**
   - Add `.env` to `.gitignore`
   - Use environment variable management in platforms

2. ✅ **Use strong secrets**
   - JWT secrets: minimum 32 characters
   - Generate random strings
   - Don't reuse secrets

3. ✅ **Rotate credentials**
   - Change secrets regularly
   - Update if compromised

4. ✅ **Separate environments**
   - Different values for dev/staging/prod
   - Don't share secrets between environments

5. ✅ **Limit access**
   - Only give access to trusted team members
   - Use platform role-based access control

6. ✅ **Monitor usage**
   - Check logs for failed auth attempts
   - Set up alerts for unusual activity

## Troubleshooting

### "Variable not found" error

**Backend:**
- Check variable name matches exactly (case-sensitive)
- Restart service after adding variables
- Check render.yaml if using infrastructure as code

**Frontend:**
- Variable must start with `VITE_`
- Redeploy after adding variables
- Check browser console for actual values

### "Invalid environment variable" error

- Check special characters are properly escaped
- Verify JSON format is valid (if using JSON values)
- Check for trailing spaces

### CORS errors

- Verify `ALLOWED_ORIGINS` includes exact frontend URL
- No trailing slashes in URLs
- Restart backend after changes

### Database connection fails

- Verify Supabase URL format
- Check service role key is correct
- Verify project is active

## Quick Reference

**Backend URL:**
```
https://your-backend.onrender.com
```

**Frontend URL:**
```
https://your-frontend.vercel.app
```

**Health Check:**
```
https://your-backend.onrender.com/health
```

**Minimal Required Variables:**

**Backend (Render):**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
```

**Frontend (Vercel):**
```
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Additional Resources

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Configuration](https://supabase.com/docs/guides/secrets)
- [Alchemy Setup](https://docs.alchemy.com/alchemy/introduction/getting-started)

