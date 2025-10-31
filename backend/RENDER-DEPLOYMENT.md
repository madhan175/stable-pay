# Deploy Backend to Render

Guide for deploying the StablePay backend to Render.com

## 🚀 Prerequisites

1. Render account (sign up at [render.com](https://render.com))
2. GitHub repository connected to Render
3. All environment variables ready

## 📋 Pre-Deployment Checklist

- [ ] Backend code is in `backend/` folder
- [ ] `package.json` has correct scripts
- [ ] All environment variables documented
- [ ] Database/Supabase configured
- [ ] CORS configured for frontend domain

## 🔧 Deployment Steps

### 1. Prepare Your Code

Ensure your `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 2. Create Render Web Service

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your repository
   - Choose the branch (usually `main`)

3. **Configure Service**

   **Basic Settings:**
   - **Name**: `stablepay-backend` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`

   **Build & Deploy:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables

Add all required environment variables in Render Dashboard:

#### Required Variables

```
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Google Cloud (for OCR)
GOOGLE_APPLICATION_CREDENTIALS_JSON={...} # JSON as string
# OR
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY=your-private-key
GOOGLE_CLIENT_EMAIL=your-client-email

# OTP Service (Twilio or similar)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
```

#### Optional Variables

```
# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configure CORS

Update your `backend/server.js` to allow your frontend domain:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### 5. Database Setup

#### Using Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and keys

2. **Run Migrations**
   - Use Supabase SQL editor or migrations
   - Execute `database/setup-supabase.sql`

3. **Update Environment Variables**
   - Add Supabase credentials to Render

### 6. File Storage

Render provides ephemeral storage. For persistent storage:

**Option A: Supabase Storage**
- Upload files to Supabase Storage
- Update your code to use Supabase Storage API

**Option B: AWS S3**
- Configure AWS S3 bucket
- Update code to use S3 SDK
- Add AWS credentials to environment variables

### 7. Deploy

1. Click "Create Web Service"
2. Render will:
   - Install dependencies
   - Build your application
   - Start the service
3. Your service will be available at:
   - `https://stablepay-backend.onrender.com` (or your custom name)

### 8. Health Check

Configure health check endpoint in Render:

- **Health Check Path**: `/health` or `/api/health`
- Your server should respond with 200 OK

Add to `server.js`:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable management
   - Rotate secrets regularly

2. **HTTPS**
   - Render provides HTTPS by default
   - Ensure your app uses HTTPS endpoints

3. **Rate Limiting**
   - Enable rate limiting in your code
   - Protect sensitive endpoints

4. **CORS**
   - Only allow specific frontend domains
   - Don't use `*` in production

## 🔄 Auto-Deploy

Render automatically deploys:
- **Auto-Deploy**: Enabled by default
- **Manual Deploy**: Disable auto-deploy if needed
- **Rollback**: Available in dashboard

### Manual Deploy

1. Go to your service
2. Click "Manual Deploy"
3. Select branch/commit
4. Deploy

## 📊 Monitoring

### Logs

- View logs in Render Dashboard
- Real-time log streaming
- Historical logs available

### Metrics

- CPU usage
- Memory usage
- Response times
- Request counts

### Alerts

Set up alerts for:
- Service downtime
- High error rates
- Resource limits

## 🐛 Troubleshooting

### Service Won't Start

1. Check logs for errors
2. Verify `start` command in package.json
3. Ensure PORT environment variable is set
4. Check Node.js version compatibility

### Build Fails

1. Check build logs
2. Verify all dependencies in package.json
3. Check Node.js version (should be 18+)
4. Ensure root directory is correct

### Environment Variables Not Working

1. Verify variables are set in Render dashboard
2. Restart service after adding variables
3. Check variable names match code exactly

### Database Connection Issues

1. Verify Supabase credentials
2. Check network access (firewall)
3. Verify database URL format

### CORS Errors

1. Verify `ALLOWED_ORIGINS` includes frontend URL
2. Check CORS configuration in code
3. Verify frontend is making requests correctly

## 💰 Pricing

Render offers:
- **Free Tier**: Limited hours/month
- **Starter Plan**: $7/month per service
- **Professional**: $25/month per service

Check [render.com/pricing](https://render.com/pricing) for current pricing.

## 🔗 Connecting Frontend

After deployment:

1. Update frontend `VITE_API_URL` environment variable
2. Set it to your Render service URL:
   ```
   VITE_API_URL=https://stablepay-backend.onrender.com
   ```

## 📝 Service Configuration Example

```yaml
Name: stablepay-backend
Environment: Node
Region: Singapore (or closest to users)
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
Plan: Starter ($7/month)
```

## ✅ Post-Deployment Checklist

- [ ] Service is running
- [ ] Health check endpoint responds
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Logs are accessible
- [ ] Monitoring enabled

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure SSL (automatic with Render)
3. Set up automated backups
4. Monitor performance
5. Set up alerts

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Node.js on Render](https://render.com/docs/node)

