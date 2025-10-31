# PWA Icons Setup Instructions

## Required Files

Place these two icon files in the `frontend/public/` folder:

1. **pwa-192x192.png** - 192×192 pixels (required)
2. **pwa-512x512.png** - 512×512 pixels (required)

## Quick Setup Steps

### Option 1: Using the Generator (Recommended)

1. **Place your 512x512 icon:**
   - Copy your `pwa-512x512.png` file to `frontend/public/` folder

2. **Generate the 192x192 version:**
   - Open `frontend/public/generate-192-icon.html` in your browser
   - It will automatically load `pwa-512x512.png` if it exists
   - Click "Generate 192x192" button
   - Click "Download 192x192 Icon" button
   - Save the downloaded file as `pwa-192x192.png` in `frontend/public/` folder

### Option 2: Manual Resize

Use any image editor (Photoshop, GIMP, online tools) to:
1. Open your 512×512 PNG image
2. Resize it to 192×192 pixels
3. Save as `pwa-192x192.png`
4. Place both files in `frontend/public/` folder

### Option 3: Online Tools

- **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- Upload your 512×512 image and download both sizes

## Verify Installation

After placing the icons:

1. Restart your dev server: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Application > Manifest tab
4. Check that icons are listed and show previews
5. Click the download button - it should now work!

## File Structure

```
frontend/
├── public/
│   ├── pwa-192x192.png  ← Required
│   ├── pwa-512x512.png  ← Required (you have this)
│   ├── generate-192-icon.html  ← Helper tool
│   └── icon-generator.html  ← Alternative generator
```

## Troubleshooting

- **Icons not showing?** Make sure files are in `frontend/public/` (not `frontend/dist/`)
- **Still not working?** Clear browser cache and hard refresh (Ctrl+Shift+R)
- **Check console:** Look for "✅ Manifest loaded" and "✅ PWA icons found!" messages

