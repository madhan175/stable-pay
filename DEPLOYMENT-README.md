# StablePay 2.0 - Complete Deployment Guide

Welcome to the StablePay 2.0 deployment documentation! This guide will help you deploy the entire application to production.


## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Deployment Guides](#deployment-guides)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

**Want to deploy fast? Start here:**

👉 **[QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)** - Complete step-by-step guide

This will have you deployed in ~1 hour!

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                     │
│  https://your-project.vercel.app                        │
│                                                           │
│  - React + Vite                                          │
│  - PWA Support                                           │
│  - Environment: VITE_* variables                        │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS API Calls
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Render (Backend)                        │
│  https://stablepay-backend.onrender.com                 │
│                                                           │
│  - Node.js + Express                                    │
│  - RESTful API                                          │
│  - Socket.IO for real-time                              │
│  - Environment: Standard variables                      │
└────────────┬────────────────────┬───────────────────────┘
             │                    │
             ▼                    ▼
┌────────────────────────┐  ┌─────────────────────────┐
│   Supabase (Database)  │  │  Blockchain RPC          │
│                        │  │  (Alchemy/Infura)        │
│  - PostgreSQL          │  │                         │
│  - Real-time           │  │  - Ethereum Mainnet     │
│  - Row Level Security  │  │  - Or Sepolia Testnet   │
└────────────────────────┘  └─────────────────────────┘
```

## ✅ Prerequisites

### Required Accounts

- [ ] **GitHub** - Code repository
- [ ] **Render** - Backend hosting ([render.com](https://render.com))
- [ ] **Vercel** - Frontend hosting ([vercel.com](https://vercel.com))
- [ ] **Supabase** - Database ([supabase.com](https://supabase.com))

### Required Tools

- Node.js 18+ installed locally
- Git installed
- Code pushed to GitHub

### Required Setup

1. Supabase project created
2. Database schema migrated
3. API keys generated

## 📚 Deployment Guides

### 1. Quick Start Guide

**For first-time deployment:**

👉 **[QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)**

Step-by-step instructions from zero to production in ~1 hour.

### 2. Environment Variables

**Complete reference:**

👉 **[DEPLOYMENT-ENV-VARS.md](./DEPLOYMENT-ENV-VARS.md)**

All environment variables with examples and how to get them.

### 3. Backend Deployment

**Detailed Render guide:**

👉 **[backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md)**

Complete guide for deploying Node.js backend to Render.

### 4. Frontend Deployment

**Detailed Vercel guide:**

👉 **[frontend/VERCEL-DEPLOYMENT.md](./frontend/VERCEL-DEPLOYMENT.md)**

Complete guide for deploying React frontend to Vercel.

## 🔧 Environment Configuration

### Minimal Required Variables

**Backend (Render):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
JWT_SECRET=random-32-char-string
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

👉 **Full list**: [DEPLOYMENT-ENV-VARS.md](./DEPLOYMENT-ENV-VARS.md)

## 🎯 Deployment Workflow

```
1. Prepare
   ├── Create Supabase project
   ├── Run database migrations
   └── Generate API keys

2. Backend → Render
   ├── Create web service
   ├── Set environment variables
   ├── Deploy
   └── Get backend URL

3. Frontend → Vercel
   ├── Create project
   ├── Set environment variables
   ├── Deploy
   └── Get frontend URL

4. Connect
   ├── Update backend CORS
   ├── Restart backend
   └── Test connection

5. Verify
   ├── Test all features
   ├── Check logs
   └── Monitor errors
```

## 📊 Typical Deployment Times

| Task | Time |
|------|------|
| Supabase setup | 10 min |
| Backend deploy | 15 min |
| Frontend deploy | 10 min |
| Configuration | 10 min |
| Testing | 15 min |
| **Total** | **~1 hour** |

## 💰 Cost Breakdown

### Minimum (Free Tier)

| Service | Cost | Limits |
|---------|------|--------|
| Render | $0 | Limited hours |
| Vercel | $0 | 100GB bandwidth |
| Supabase | $0 | 500MB database |
| **Total** | **$0** | Good for testing |

### Production Recommended

| Service | Cost | Benefits |
|---------|------|----------|
| Render | $7-$25 | Always on, better performance |
| Vercel | $0-$20 | Analytics, previews |
| Supabase | $0-$25 | More storage, backups |
| **Total** | **$7-$70** | Production ready |

## 🚦 Post-Deployment Checklist

### Immediate

- [ ] Test OTP login
- [ ] Test KYC upload
- [ ] Test transactions
- [ ] Check for console errors
- [ ] Verify CORS working
- [ ] Test on mobile

### Within 24 Hours

- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Review logs
- [ ] Test all features
- [ ] Check performance

### Within 1 Week

- [ ] Set up custom domain
- [ ] Enable analytics
- [ ] Configure backups
- [ ] Security audit
- [ ] Performance optimization

## 🔍 Monitoring & Maintenance

### Health Checks

**Backend:**
```bash
curl https://your-backend.onrender.com/health
```

**Frontend:**
```bash
# Just visit: https://your-frontend.vercel.app
```

### Logs

**Render:**
- Dashboard → Service → Logs

**Vercel:**
- Dashboard → Project → Logs

### Alerts

Set up alerts for:
- Service downtime
- High error rates
- Unusual traffic
- Database issues

## 🐛 Common Issues & Solutions

### CORS Errors

**Symptom:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
1. Add frontend URL to `ALLOWED_ORIGINS` in backend
2. Restart backend service
3. Clear browser cache

### API Not Found

**Symptom:**
```
Failed to fetch /api/...
```

**Solution:**
1. Check `VITE_API_URL` is correct
2. Verify backend is running
3. Test backend health endpoint

### Database Connection Failed

**Symptom:**
```
Failed to connect to database
```

**Solution:**
1. Verify Supabase credentials
2. Check project is not paused
3. Review network settings

### Build Fails

**Symptom:**
```
Build error: Cannot find module
```

**Solution:**
1. Check root directory is correct
2. Verify all dependencies in package.json
3. Check Node.js version (18+)

## 📞 Support Resources

### Documentation

- [Main Deployment Guide](./DEPLOYMENT.md)
- [Quick Steps](./QUICK-DEPLOYMENT-STEPS.md)
- [Environment Variables](./DEPLOYMENT-ENV-VARS.md)
- [Backend Guide](./backend/RENDER-DEPLOYMENT.md)
- [Frontend Guide](./frontend/VERCEL-DEPLOYMENT.md)

### Platform Docs

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Community

- GitHub Issues
- Stack Overflow
- Platform support forums

## 🎓 Learning Resources

### New to Deployment?

1. Read [QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)
2. Follow along with test deployment
3. Read [DEPLOYMENT-ENV-VARS.md](./DEPLOYMENT-ENV-VARS.md)
4. Explore detailed guides

### Advanced Users

1. Use [render.yaml](./backend/render.yaml) for IaC
2. Set up CI/CD pipelines
3. Configure custom domains
4. Enable advanced monitoring

## 🔒 Security Best Practices

### Secrets Management

- ✅ Never commit `.env` files
- ✅ Use environment variables
- ✅ Rotate secrets regularly
- ✅ Use strong passwords
- ✅ Limit access rights

### CORS Configuration

- ✅ Only allow specific origins
- ✅ Never use wildcard (*)
- ✅ Include production and staging
- ✅ Review regularly

### Database Security

- ✅ Use Row Level Security
- ✅ Minimize service role key usage
- ✅ Regular backups
- ✅ Monitor access logs

### Network Security

- ✅ Always use HTTPS
- ✅ Enable rate limiting
- ✅ Validate all inputs
- ✅ Sanitize user data

## 📈 Scaling Considerations

### When to Scale

- **Users**: 100+ concurrent users
- **Traffic**: 1M+ requests/month
- **Storage**: 10GB+ database
- **Features**: Real-time features

### Scaling Options

**Render:**
- Upgrade to Professional plan
- Add more instances
- Enable auto-scaling

**Vercel:**
- Upgrade to Pro plan
- Enable edge caching
- Use serverless functions

**Supabase:**
- Upgrade to Pro plan
- Enable read replicas
- Use connection pooling

## 🎉 Success Criteria

Your deployment is successful when:

✅ Frontend loads without errors
✅ OTP login works
✅ KYC upload works
✅ Transactions process correctly
✅ No CORS errors
✅ Database operations work
✅ Health checks pass
✅ Mobile app works
✅ Performance is acceptable

## 🚀 Next Steps

After successful deployment:

1. **Customize**
   - Add your branding
   - Configure features
   - Set up analytics

2. **Optimize**
   - Performance tuning
   - Caching strategies
   - Image optimization

3. **Expand**
   - Add more features
   - Integrate APIs
   - Scale infrastructure

4. **Monitor**
   - Set up alerts
   - Review metrics
   - Collect feedback

## 📝 Quick Links

- **Quick Start**: [QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)
- **Environment Setup**: [DEPLOYMENT-ENV-VARS.md](./DEPLOYMENT-ENV-VARS.md)
- **Backend Guide**: [backend/RENDER-DEPLOYMENT.md](./backend/RENDER-DEPLOYMENT.md)
- **Frontend Guide**: [frontend/VERCEL-DEPLOYMENT.md](./frontend/VERCEL-DEPLOYMENT.md)
- **Main Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Contributing

Found an issue with deployment? Have a suggestion?

1. Check existing issues
2. Create detailed bug report
3. Include logs and configs
4. Suggest improvements

## 📜 License

See main project license.

---

**Ready to deploy?** Start with [QUICK-DEPLOYMENT-STEPS.md](./QUICK-DEPLOYMENT-STEPS.md)

**Need help?** Check [Troubleshooting](#troubleshooting) section above

**Questions?** Open an issue or check documentation

Good luck! 🚀

