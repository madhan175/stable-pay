# 📱 iPhone Installation & MetaMask Connection Guide

This guide explains how to install StablePay on your iPhone and connect to MetaMask.

## 🚀 Installing StablePay on iPhone

### Step 1: Open StablePay in Safari

1. Open **Safari** browser on your iPhone
2. Navigate to your StablePay website URL
3. Wait for the page to load completely

### Step 2: Add to Home Screen

1. Tap the **Share button** (square with arrow pointing up) at the bottom of Safari
2. Scroll down in the share menu
3. Tap **"Add to Home Screen"**
4. You can customize the name (default is "StablePay")
5. Tap **"Add"** in the top right corner

### Step 3: Launch from Home Screen

- The StablePay icon will appear on your home screen
- Tap it to open the app in full-screen mode (like a native app!)

## 🔗 Connecting MetaMask on iPhone

### Option 1: MetaMask In-App Browser (Recommended & Most Reliable)

This is the **best method** for iPhone users as it provides full compatibility:

1. **Install MetaMask App**
   - Open App Store on your iPhone
   - Search for "MetaMask"
   - Install the official MetaMask app by ConsenSys

2. **Create or Import Wallet**
   - Open MetaMask app
   - Create a new wallet or import an existing one
   - Make sure to save your recovery phrase securely!

3. **Open StablePay in MetaMask Browser**
   - Open MetaMask app
   - Tap the **Browser** tab (bottom navigation)
   - Enter your StablePay website URL
   - The site will load in MetaMask's built-in browser
   - Tap **"Connect MetaMask"** button
   - Approve the connection - it works instantly!

### Option 2: Deep Link from Safari PWA

1. **Install MetaMask App** (same as Option 1)

2. **Open StablePay PWA** (from home screen or Safari)

3. **Connect via Deep Link**
   - Tap **"Connect MetaMask"** button
   - This will try to open MetaMask app
   - Approve the connection in MetaMask
   - Note: This method may require returning to Safari manually

⚠️ **Important**: iPhone Safari doesn't support browser extensions like MetaMask desktop. You **must** use the MetaMask mobile app (either in-app browser or deep linking).

### Switching to Sepolia Testnet

After connecting MetaMask:

1. The app will automatically try to switch to Sepolia testnet
2. If prompted, approve adding Sepolia testnet to MetaMask
3. You'll need Sepolia ETH for transaction fees (not regular ETH!)
4. Get free Sepolia ETH from faucets like:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

## 📋 Requirements

- iPhone with iOS 14.5 or later
- Safari browser
- MetaMask mobile app installed
- Internet connection (HTTPS required for PWA)

## 🎯 Troubleshooting

### "MetaMask not installed" Error

**Solution**: Install MetaMask app from the App Store. The link is provided in the StablePay app when you try to connect.

### Connection Not Working

1. Make sure MetaMask app is installed and wallet is unlocked
2. Try disconnecting and reconnecting
3. Clear Safari cache and reload the app
4. Make sure you're using HTTPS (not HTTP)

### Can't Add to Home Screen

- Make sure you're using Safari (not Chrome or other browsers on iPhone)
- Check that the website is using HTTPS
- Try refreshing the page and trying again

### App Not Loading

- Check your internet connection
- Make sure you're using the correct URL
- Try clearing Safari cache: Settings → Safari → Clear History and Website Data

## 🔒 Security Tips

1. **Never share your MetaMask recovery phrase** with anyone
2. **Verify the website URL** before connecting your wallet
3. **Only connect to trusted sites** (your StablePay deployment URL)
4. **Use Sepolia testnet** for testing (free test tokens)
5. **Keep MetaMask app updated** from App Store

## ✨ Features Available

Once installed and connected:

- ✅ Full app-like experience (no browser UI)
- ✅ Works offline (cached resources)
- ✅ Fast loading (service worker caching)
- ✅ Connect to MetaMask mobile app
- ✅ Send and receive USDT
- ✅ View transaction history
- ✅ Complete KYC verification

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for error messages
2. Verify MetaMask app is properly installed
3. Ensure you're on Sepolia testnet
4. Check that you have enough Sepolia ETH for gas fees

---

**Note**: This app works best on HTTPS. For local development, you may need to enable HTTPS or use a local HTTPS proxy.

