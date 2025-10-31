#!/usr/bin/env node

/**
 * Generate PWA icons from a source image
 * Usage: node scripts/generate-pwa-icons.js <path-to-source-image>
 * Or: node scripts/generate-pwa-icons.js (will look for pwa-512x512.png in public folder)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available (for image resizing)
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('📦 Sharp not installed. Installing...');
  console.log('Run: npm install --save-dev sharp');
  process.exit(1);
}

const publicDir = path.join(__dirname, '../public');
const source512 = process.argv[2] || path.join(publicDir, 'pwa-512x512.png');
const output192 = path.join(publicDir, 'pwa-192x192.png');

async function generateIcons() {
  try {
    // Check if source file exists
    if (!fs.existsSync(source512)) {
      console.error('❌ Source image not found:', source512);
      console.log('\n📝 Instructions:');
      console.log('1. Place your 512x512 PNG icon in frontend/public/pwa-512x512.png');
      console.log('2. Run: node scripts/generate-pwa-icons.js');
      console.log('\nOr provide the path:');
      console.log('   node scripts/generate-pwa-icons.js path/to/your-icon.png');
      process.exit(1);
    }

    console.log('✅ Found source image:', source512);
    console.log('🔄 Generating 192x192 icon...');

    // Resize to 192x192
    await sharp(source512)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(output192);

    console.log('✅ Generated:', output192);
    console.log('\n🎉 PWA icons are ready!');
    console.log('   ✓ pwa-512x512.png (should already exist)');
    console.log('   ✓ pwa-192x192.png (just created)');
    console.log('\n📱 Your PWA should now be installable!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n💡 Install sharp: npm install --save-dev sharp');
    }
    process.exit(1);
  }
}

generateIcons();

