# Deploy Frontend to Vercel

Complete guide for deploying the StablePay frontend to Vercel and connecting it to your Render backend.

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub repository connected to Vercel
3. Backend deployed on Render (you need the backend URL)
4. Environment variables ready

## Deployment Steps

### Step 1: Deploy Backend First (REQUIRED)

**⚠️ IMPORTANT**: Deploy your backend to Render first and get its URL. You'll need this URL to configure the frontend.

Your backend URL will look like: `https://stablepay-backend.onrender.com`

### Step 2: Connect Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

### Step 3: Configure Project Settings

**Configure Build Settings:**

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` (IMPORTANT!)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `18.x` or higher (auto-detected from `package.json`)

**Vercel will auto-detect Vite**, but verify these settings are correct.

#### Advanced Build Settings

You can also configure additional settings in Vercel dashboard:

- **Ignore Build Step**: Leave empty (build on every push)
- **Install Command**: `npm install` (default)
- **Environment**: Production, Preview, Development
- **Command Override**: Leave empty (use `package.json` scripts)

**Note**: The `vercel.json` file in your repository will override dashboard settings, so you don't need to configure headers manually.

### Step 4: Set Environment Variables

**CRITICAL**: Add these environment variables in Vercel:

1. Go to "Environment Variables" in project settings
2. Add the following variables:

#### Required Variables

```env
# Backend API URL (Your Render backend URL)
VITE_API_URL=https://your-backend.onrender.com

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Smart Contract Address (if using)
VITE_CONTRACT_ADDRESS=0x...
VITE_USDT_ADDRESS=0x...
```

#### Important Notes

- Replace `https://your-backend.onrender.com` with your actual Render backend URL
- Get Supabase keys from your Supabase project settings (Project Settings → API)
- Contract addresses are optional but recommended for full functionality
- All variables MUST start with `VITE_` to be exposed to the frontend
- Set environment-specific values (Production, Preview, Development)

#### Optional Variables

```env
# Node Environment
NODE_ENV=production

# Blockchain Network (default: sepolia testnet)
VITE_NETWORK=sepolia

# Feature Flags
VITE_ENABLE_MOCK_MODE=false
```

### Step 5: Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build your application
   - Deploy to production
3. Your frontend will be available at: `https://your-project.vercel.app`

### Step 6: Update Backend CORS

**CRITICAL**: After deployment, update your backend to allow the Vercel domain:

1. Go to your Render dashboard
2. Add environment variable:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app,https://your-project.vercel.app
   ```
3. Restart the backend service

**OR** if you already have `ALLOWED_ORIGINS` set, add your Vercel URL:
```
ALLOWED_ORIGINS=https://your-project.vercel.app,https://another-domain.com
```

## Automatic Deployments

Vercel automatically redeploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

## Custom Domain (Optional)

1. Go to project settings → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `ALLOWED_ORIGINS` in backend with your custom domain

## Environment Variables by Environment

Set different values for different environments:

- **Production**: Production URLs
- **Preview**: Preview/staging URLs
- **Development**: Localhost URLs

Example:

**Production:**
```
VITE_API_URL=https://stablepay-backend.onrender.com
```

**Preview:**
```
VITE_API_URL=https://stablepay-backend-staging.onrender.com
```

## PWA Configuration

This project includes Progressive Web App (PWA) functionality. The `vercel.json` file is already configured with:

- ✅ Service worker caching headers (`Service-Worker-Allowed`)
- ✅ Workbox asset caching (regex pattern: `/workbox-(.*)\\.js`)
- ✅ Manifest file headers (proper MIME type)
- ✅ React Router rewrites for SPA navigation
- ✅ Static asset optimization (JS, CSS, images, fonts)
- ✅ Vite build output optimization

### PWA Features on Vercel

- **Offline Support**: Service worker caches assets and API responses
- **Install Prompt**: Users can install the app on their devices
- **Fast Loading**: Optimized caching with proper cache-control headers
- **Mobile Optimized**: Standalone display mode for native app feel
- **Production Ready**: Automatic asset optimization and CDN delivery

### Adding PWA Icons

Before deploying, ensure you have PWA icons in the `frontend/public` folder:

1. Generate icons using `public/icon-generator.html`
2. Or use online tools like [PWA Builder](https://www.pwabuilder.com/imageGenerator)
3. Required files:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png` (180x180 for iOS)

See `PWA-SETUP.md` for detailed icon generation instructions.

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
- **Solution**: Ensure `Root Directory` is set to `frontend`

**Error**: Environment variables not working
- **Solution**: Variable names must start with `VITE_` to be exposed to frontend
- Restart deployment after adding variables

**Error**: "Port already in use"
- **Solution**: Vercel handles this automatically, shouldn't occur

### Frontend Can't Connect to Backend

**CORS Error**:
1. Verify `ALLOWED_ORIGINS` in backend includes your Vercel URL
2. Check URL format (no trailing slash)
3. Restart backend service

**API Error 404**:
1. Verify `VITE_API_URL` is correct
2. Check backend is running on Render
3. Visit backend health endpoint: `https://your-backend.onrender.com/health`

**Network Error**:
1. Check backend service is active on Render
2. Review backend logs in Render dashboard
3. Test backend endpoints directly in browser

### Supabase Connection Issues

**Error**: "Failed to initialize Supabase"
1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is active

### PWA Not Working

**Issue**: Service worker not registering
1. Check build output includes PWA files
2. Review console for service worker errors
3. Clear browser cache

**Issue**: Service worker cache issues
1. Check `vercel.json` headers configuration
2. Verify service worker is served with correct headers
3. Clear application data and hard refresh
4. Use Chrome DevTools → Application → Clear Storage

## Testing Production

After deployment, test:

1. ✅ Visit your Vercel URL
2. ✅ Test OTP login
3. ✅ Test KYC upload
4. ✅ Test transaction creation
5. ✅ Check browser console for errors
6. ✅ Verify API calls in Network tab

## Monitoring

### Vercel Analytics

Enable in project settings:
- Real User Monitoring (RUM)
- Web Vitals tracking

### Logs

View deployment logs:
- Click on deployment
- View "Build Logs"
- View "Function Logs" (if using serverless functions)

## Performance Optimization

### Vercel Automatic Optimizations

- ✅ **Automatic Image Optimization**: WebP conversion, lazy loading
- ✅ **Edge Network (CDN)**: Global content delivery
- ✅ **Automatic HTTPS**: SSL/TLS certificates
- ✅ **Code Splitting**: Automatic route-based splitting
- ✅ **Asset Compression**: Gzip/Brotli compression
- ✅ **Static Asset Caching**: Immutable cache headers

### Configured Optimizations

Your `vercel.json` includes:

- **Service Worker**: Offline support with smart caching
- **Workbox**: Long-term cache for static assets
- **Asset Caching**: 1-year cache for JS, CSS, images, fonts
- **Manifest Caching**: 1-hour cache for PWA manifest
- **SPA Routing**: React Router rewrites for client-side navigation

### Performance Best Practices

1. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

2. **Monitor Bundle Size**
   - Keep main bundle < 250KB gzipped
   - Lazy load non-critical components
   - Use dynamic imports for heavy libraries

3. **Enable Vercel Analytics**
   - Real User Monitoring (RUM)
   - Web Vitals tracking (LCP, FID, CLS)
   - Custom event tracking

4. **Image Optimization**
   - Use WebP format when possible
   - Implement lazy loading
   - Use appropriate image sizes

5. **Code Splitting**
   - Route-based splitting (already configured)
   - Component-based splitting for heavy components
   - Dynamic imports for ethers.js and other large libs

## Cost

Vercel Pricing:
- **Hobby**: Free for personal projects
- **Pro**: $20/month for teams
- **Enterprise**: Custom pricing

Free tier includes:
- Unlimited personal deployments
- 100GB bandwidth/month
- Automatic SSL

## Next Steps

After deployment:

1. ✅ Test all features
2. ✅ Update backend CORS
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring
5. ✅ Enable analytics
6. ✅ Configure backups

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console
3. Verify environment variables
4. Test backend connectivity

## Quick Reference

**Deployment URL Format:**
```
https://your-project.vercel.app
```

**Backend URL Format (Render):**
```
https://your-backend.onrender.com
```

**Required Environment Variables:**
```
VITE_API_URL=<backend-url>
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<supabase-key>
```

**Backend CORS Setting (Render):**
```
ALLOWED_ORIGINS=https://your-project.vercel.app
```

