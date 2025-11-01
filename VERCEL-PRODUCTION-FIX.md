# How to Fix Vercel Production Deployment Issues

## Problem
Production deployments have wrong code while preview deployments work correctly.

## Root Cause
Production might be deploying from wrong branch or has caching issues.

## Solutions

### Solution 1: Verify Production Branch in Vercel ✅
1. Go to https://vercel.com/dashboard
2. Open your project: `stable-pay-2.1` or `stable-pay`
3. Click **Settings** → **Git**
4. Verify **Production Branch** is set to: `main`
5. If it's wrong, change it to `main` and save

### Solution 2: Force Clean Redeploy
**Method A: Via Dashboard**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Find your production deployment
4. Click **"..."** menu → **Redeploy**
5. Select **"Use existing Build Cache"** = ❌ OFF (clean build)

**Method B: Via Git Push (Already Done!)**
```bash
# Already completed:
git checkout main
git merge stable-pay-2.1
git push origin main
```
Vercel will automatically redeploy production when you push to main.

### Solution 3: Check Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Verify **Production** environment has:
   ```
   VITE_API_URL=https://stable-pay-mkkj.onrender.com
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. If missing, add them
4. After adding variables, redeploy production

### Solution 4: Clear Build Cache
1. Go to Vercel Dashboard
2. Settings → General → **"Clear Build Cache"**
3. This forces a complete rebuild

### Solution 5: Check Build Logs
1. Vercel Dashboard → Deployments
2. Click on latest production deployment
3. View Build Logs
4. Look for errors or warnings
5. Common issues:
   - Missing environment variables
   - Build command failing
   - TypeScript errors

## Quick Verification Checklist

### ✅ Branch Sync
- [x] `stable-pay-2.1` branch pushed
- [x] `main` branch has latest code merged
- [x] Both branches in sync

### ⚠️ Vercel Dashboard Check
- [ ] Production branch = `main` in Vercel settings
- [ ] Latest production deployment shows correct commit hash
- [ ] Production environment variables set
- [ ] No build errors in logs

### 🔧 After Fix
- [ ] Production URL works: https://stable-pay-21.vercel.app
- [ ] No CORS errors in console
- [ ] Socket.io connects successfully
- [ ] PWA install button works
- [ ] All features work as expected

## Troubleshooting Commands

**Check branch sync:**
```bash
git checkout main
git log --oneline -5  # Should show latest commits
git checkout stable-pay-2.1
git log --oneline -5  # Should match main
```

**Force clean rebuild locally:**
```bash
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

## Next Steps After Fix
1. Wait 2-3 minutes for Vercel deployment
2. Visit production URL
3. Hard refresh: Ctrl+Shift+R
4. Check browser console for errors
5. Test all features

## Still Not Working?
If production still has wrong code after following all steps:

1. **Delete and re-deploy:**
   - Vercel Dashboard → Settings → Danger Zone
   - Delete project (backup first!)
   - Re-import from GitHub
   - Reconfigure settings

2. **Check for multiple projects:**
   - You might have multiple Vercel projects
   - Verify you're checking the right production URL

3. **Contact Vercel Support:**
   - Provide deployment logs
   - Share screenshot of settings
   - Explain issue clearly

---

**Last Updated:** After pushing to main - production should deploy correctly now!

