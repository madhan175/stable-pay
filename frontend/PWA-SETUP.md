# Progressive Web App (PWA) Setup Guide

This guide explains how to set up and use the Progressive Web App (PWA) functionality for StablePay 2.0.

## ✅ What's Already Configured

- ✅ PWA plugin installed (`vite-plugin-pwa`)
- ✅ Service worker configuration
- ✅ Manifest file configuration
- ✅ Mobile-optimized meta tags
- ✅ Install prompt component
- ✅ Offline caching support

## 🎨 Creating App Icons

To complete the PWA setup, you need to add app icons. Here are your options:

### Option 1: Use the Icon Generator (Easiest)

1. Open `public/icon-generator.html` in your browser
2. Upload your logo image
3. Adjust settings if needed
4. Generate and download the icons
5. Place the downloaded files in the `public/` folder

### Option 2: Use Online Tools

Use these tools to generate PWA icons from a single source image:

- **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon.io**: https://favicon.io/

### Required Icon Sizes

Place these files in the `public/` folder:

- `pwa-192x192.png` - 192x192 pixels (required)
- `pwa-512x512.png` - 512x512 pixels (required)
- `apple-touch-icon.png` - 180x180 pixels (for iOS)

### Option 3: Create Icons Manually

If you have a design tool (Photoshop, Figma, etc.):

1. Create a square image with your logo
2. Export at 192x192, 512x512, and 180x180 sizes
3. Save as PNG files
4. Place in the `public/` folder

## 📱 Testing the PWA

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in a mobile browser or Chrome DevTools mobile emulation

3. Look for the install prompt banner (appears after 3 seconds)

### Production Build

1. Build the app:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Test on a real mobile device:
   - **Android/Chrome**: You'll see an install banner
   - **iOS/Safari**: Tap Share → Add to Home Screen

## 🔧 Features

### Install Prompt

The app automatically shows an install prompt to users:
- **Android/Chrome**: Native browser install prompt
- **iOS/Safari**: Custom instructions for manual installation

The prompt:
- Appears after 3 seconds (first visit only)
- Can be dismissed
- Remembers user preference (won't show again if dismissed)

### Offline Support

The PWA includes:
- Service worker for offline caching
- Automatic caching of static assets
- API response caching (1 hour)

### Mobile Optimization

- Responsive design
- Touch-optimized interface
- Standalone display mode
- Portrait orientation lock
- Full-screen experience

## 📋 Manifest Configuration

The app manifest includes:

- **Name**: StablePay 2.0
- **Short Name**: StablePay
- **Theme Color**: #3b82f6 (Blue)
- **Background Color**: #ffffff (White)
- **Display Mode**: Standalone (appears like a native app)
- **Orientation**: Portrait

You can customize these in `vite.config.ts`.

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Add proper app icons (192x192, 512x512, 180x180)
- [ ] Test install prompt on Android device
- [ ] Test install prompt on iOS device
- [ ] Verify offline functionality
- [ ] Test service worker updates
- [ ] Check manifest in browser DevTools
- [ ] Verify theme colors match your brand

## 🔍 Verifying PWA Setup

### Chrome DevTools

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check:
   - **Manifest**: Should show your app details
   - **Service Workers**: Should show active service worker
   - **Storage**: Check cached files

### Lighthouse PWA Audit

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Run audit
5. Fix any issues reported

## 🐛 Troubleshooting

### Icons Not Showing

- Make sure icon files are in the `public/` folder
- Verify file names match exactly: `pwa-192x192.png`, `pwa-512x512.png`
- Clear browser cache and rebuild

### Install Prompt Not Appearing

- Make sure you're using HTTPS (or localhost for development)
- Check that service worker is registered
- Verify manifest is valid
- Try a different browser/device

### Service Worker Not Updating

- Unregister old service worker in DevTools
- Clear site data
- Rebuild and redeploy

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 🎯 Next Steps

1. Generate or create your app icons
2. Test the install prompt on mobile devices
3. Customize theme colors if needed
4. Deploy and enjoy your installable web app!

