# StablePay Deployment Guide

This document provides an overview of the StablePay project structure and deployment instructions.

## 📁 Project Structure

```
StablePay2.0/
├── frontend/          # React + Vite frontend (Deploy to Vercel)
├── backend/          # Node.js + Express backend (Deploy to Render)
├── contarcts/        # Smart contracts (Deploy separately)
└── README.md         # Project overview
```

## 🚀 Deployment Overview

**🚀 START HERE**: [Quick Deployment Steps](./QUICK-DEPLOYMENT-STEPS.md) - Follow this for fastest deployment

### Frontend → Vercel
- **Location**: `frontend/` folder
- **Platform**: Vercel
- **Framework**: Vite + React
- **Documentation**: 
  - [Quick Steps](./QUICK-DEPLOYMENT-STEPS.md)
  - [Detailed Guide](./frontend/VERCEL-DEPLOYMENT.md)
  - [README](./frontend/README.md)

### Backend → Render
- **Location**: `backend/` folder
- **Platform**: Render
- **Runtime**: Node.js
- **Documentation**: 
  - [Quick Steps](./QUICK-DEPLOYMENT-STEPS.md)
  - [Detailed Guide](./backend/RENDER-DEPLOYMENT.md)
  - [Infrastructure Config](./backend/render.yaml)

### Smart Contracts
- **Location**: `contarcts/` folder
- **Platform**: Deploy to Sepolia/Ethereum
- **Documentation**: See [contarcts/README.md](./contarcts/README.md)

## 🔗 Deployment Workflow

1. **Deploy Backend First** (Render)
   - Backend must be live before frontend
   - Get backend URL (e.g., `https://stablepay-backend.onrender.com`)

2. **Configure Frontend** (Vercel)
   - Set `VITE_API_URL` to backend URL
   - Deploy frontend

3. **Update Backend CORS**
   - Add frontend Vercel URL to `ALLOWED_ORIGINS`
   - Restart backend service

## 📋 Environment Variables

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_CONTRACT_ADDRESS=0x... (optional)
```

### Backend (Render)
```
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
JWT_SECRET=your-secret
GOOGLE_APPLICATION_CREDENTIALS_JSON={...}
ALLOWED_ORIGINS=https://your-frontend.vercel.app
... (see backend/RENDER-DEPLOYMENT.md for complete list)
```

## 🔐 Security Checklist

- [ ] All secrets stored as environment variables
- [ ] Never commit `.env` files
- [ ] CORS configured for specific domains
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Database credentials secure
- [ ] API rate limiting enabled

## 📚 Detailed Documentation

### Deployment Guides

- **🚀 Quick Start**: [QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md) - Step-by-step deployment guide
- **🔧 Environment Variables**: [DEPLOYMENT-ENV-VARS.md](./DEPLOYMENT-ENV-VARS.md) - Complete env vars reference
- **📦 Backend Details**: [backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md) - Render deployment guide
- **🌐 Frontend Details**: [frontend/VERCEL-DEPLOYMENT.md](./frontend/VERCEL-DEPLOYMENT.md) - Vercel deployment guide

### Other Documentation

- **Frontend**: [frontend/README.md](./frontend/README.md)
- **Backend**: [backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md)
- **Contracts**: [contarcts/README.md](./contarcts/README.md)
- **Infrastructure**: [backend/render.yaml](./backend/render.yaml)

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is correct
- Verify backend CORS allows frontend domain
- Check backend is running and accessible

### Build failures
- Verify all environment variables are set
- Check Node.js version compatibility
- Review build logs for specific errors

### CORS errors
- Add frontend URL to backend `ALLOWED_ORIGINS`
- Verify URL format (no trailing slash)
- Restart backend after CORS changes

## 📞 Support

For deployment issues, check:
1. Platform-specific documentation (Vercel/Render)
2. Application logs in dashboard
3. Build/deployment logs

