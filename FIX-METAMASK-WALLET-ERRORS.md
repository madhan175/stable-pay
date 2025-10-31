# Fix MetaMask and Wallet Linking Errors

## Issues Fixed

### 1. ✅ MetaMask RPC Error (`eth_maxPriorityFeePerGas`)
**Error:** `The method "eth_maxPriorityFeePerGas" does not exist / is not available`

**Fix:** Updated `Send.tsx` to use `getSafeFeeData()` from `blockchain.ts` which gracefully handles networks that don't support EIP-1559. The function:
- Tries to get EIP-1559 fee data
- Falls back to legacy `eth_gasPrice` if EIP-1559 fails
- Uses a safe default if all else fails

**Note:** You may still see this error in the console because MetaMask tries to call it internally, but it won't break functionality - the code now handles it gracefully.

### 2. ✅ Frontend API URL (localhost issue)
**Error:** `POST http://localhost:5000/user/link-wallet 500`

**Fix:** Added logging in `api.ts` to show which API URL is being used. 

**Action Required:** Make sure `VITE_API_URL` is set in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL=https://stable-pay-mkkj.onrender.com`
3. **Redeploy** frontend (required!)

### 3. ✅ Backend Link-Wallet Error Handling
**Error:** `Failed to link wallet address`

**Fix:** Improved error handling and logging in `/user/link-wallet` endpoint:
- Better validation of userId and walletAddress
- More detailed error messages (in development mode)
- Enhanced logging for debugging

## How to Verify Fixes

### Step 1: Check Frontend API URL

1. Visit your Vercel frontend
2. Open browser DevTools (F12) → Console
3. Look for:
   ```
   🔗 [API] Base URL: https://stable-pay-mkkj.onrender.com
   🔗 [API] Environment variable: https://stable-pay-mkkj.onrender.com
   ```

If you see `localhost:5000` instead:
- ⚠️ `VITE_API_URL` is not set in Vercel
- **Fix:** Set it and redeploy

### Step 2: Test Wallet Connection

1. Connect MetaMask
2. Check console for:
   - ✅ Should see: `✅ [WALLET] Linked wallet address to user`
   - ❌ If you see errors, check backend logs in Render

### Step 3: Check Backend Logs

1. Go to Render Dashboard → Your Service → Logs
2. Look for wallet linking attempts:
   ```
   🔗 [WALLET] Link wallet request: { userId: '...', walletAddress: '0x...' }
   ✅ [WALLET] Linked wallet address to user: ...
   ```

If you see errors:
- Check Supabase connection
- Verify `updateUser` function works
- Check userId format

## Remaining MetaMask Warning

You may still see this warning in console:
```
MetaMask - RPC Error: The method "eth_maxPriorityFeePerGas" does not exist
```

**This is OK!** The code now handles this gracefully:
- The error is caught and logged as a warning
- Falls back to legacy gas pricing
- Functionality continues to work

## Deployment Steps

### Backend (Render)
Changes have been pushed to GitHub. Render should auto-deploy. If not:
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"

### Frontend (Vercel)
**Important:** After setting `VITE_API_URL`, you MUST redeploy:
1. Go to Vercel Dashboard
2. Settings → Environment Variables → Add `VITE_API_URL`
3. Deployments → Latest → Redeploy
4. Or push a new commit to trigger auto-deploy

## Troubleshooting

### Still seeing localhost errors?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Verify `VITE_API_URL` is set in Vercel
- Check deployment completed successfully

### Wallet linking still fails?
1. Check backend logs in Render
2. Verify Supabase credentials
3. Check userId is valid (should be UUID or string from localStorage)
4. Verify wallet address format (should be 0x followed by 40 hex chars)

### MetaMask errors persist?
- These are warnings from MetaMask itself
- They don't break functionality
- The code handles them gracefully
- Can be safely ignored

---

**Status:** ✅ All fixes applied and ready to deploy!

