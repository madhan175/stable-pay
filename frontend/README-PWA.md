# 📱 Progressive Web App (PWA) - Quick Start

Your StablePay app is now a **Progressive Web App**! Users can download and install it on their mobile devices.

## ✨ What's New

✅ **Install Button**: Users will see a download/install prompt  
✅ **Mobile Optimized**: Perfect for mobile devices  
✅ **Offline Support**: Works offline with cached resources  
✅ **App-like Experience**: Runs in standalone mode like a native app  

## 🚀 Quick Setup (3 Steps)

### Step 1: Generate Icons

Open `public/icon-generator.html` in your browser and generate the required icons:
- `pwa-192x192.png`
- `pwa-512x512.png`  
- `apple-touch-icon.png`

### Step 2: Test Locally

```bash
npm run dev
```

Open in Chrome/Edge and look for the install prompt!

### Step 3: Build & Deploy

```bash
npm run build
```

Deploy to a server with HTTPS (required for PWA installation).

## 📱 How Users Install

### Android/Chrome
1. Visit your website
2. Wait for the install banner (appears automatically)
3. Tap "Install Now"
4. App appears on home screen

### iOS/Safari
1. Visit your website
2. Tap the Share button (bottom bar)
3. Select "Add to Home Screen"
4. Tap "Add"

## 🎨 Customization

Edit `vite.config.ts` to customize:
- App name and description
- Theme colors
- Icon paths
- Display mode

See `PWA-SETUP.md` for detailed documentation.

