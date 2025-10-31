/**
 * Quick script to check if Google Cloud credentials are properly configured
 * Run: node check-credentials.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Google Cloud Credentials Configuration...\n');

// Check for .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found in backend/ directory');
  console.log('📋 Create a .env file from env.example\n');
  process.exit(1);
}
console.log('✅ .env file found');

// Load environment variables
require('dotenv').config();

// Check GOOGLE_APPLICATION_CREDENTIALS
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set in .env');
  console.log('📋 Add this to your .env file:');
  console.log('   GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json\n');
  process.exit(1);
}
console.log(`✅ GOOGLE_APPLICATION_CREDENTIALS=${credentialsPath}`);

// Check if credentials file exists
const fullPath = path.isAbsolute(credentialsPath)
  ? credentialsPath
  : path.join(__dirname, credentialsPath);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Credentials file not found: ${fullPath}`);
  console.log('📋 Make sure the service account key file exists in the backend/ folder\n');
  process.exit(1);
}
console.log(`✅ Credentials file found: ${fullPath}`);

// Check file content
try {
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const credJson = JSON.parse(fileContent);

  // Check if it's a service account key (not OAuth client secret)
  if (credJson.web || credJson.installed) {
    console.error('\n❌ ERROR: This is an OAuth client secret, not a service account key!');
    console.error('❌ Files named "client_secret_*.json" are OAuth secrets and will NOT work');
    console.error('❌ OAuth client secrets are for user authentication, not server APIs');
    console.log('\n📋 SOLUTION: You need a SERVICE ACCOUNT KEY instead');
    console.log('\n📖 STEP-BY-STEP INSTRUCTIONS:');
    console.log('   1. Read: backend/FIX-NOW.md (complete step-by-step guide)');
    console.log('   2. Or read: backend/SETUP-GOOGLE-CREDENTIALS.md (detailed guide)');
    console.log('   3. Or read: backend/CREDENTIALS-EXPLAINED.md (explains the difference)');
    console.log('\n🔗 Quick Link: Create Service Account');
    console.log('   https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001\n');
    process.exit(1);
  }

  if (credJson.type !== 'service_account') {
    console.error(`❌ Invalid credentials type: ${credJson.type}`);
    console.error('❌ Expected: "service_account"');
    process.exit(1);
  }
  console.log(`✅ Credentials type: ${credJson.type}`);

  // Check required fields
  const requiredFields = ['client_email', 'private_key', 'project_id'];
  const missing = requiredFields.filter(field => !credJson[field]);

  if (missing.length > 0) {
    console.error(`❌ Missing required fields: ${missing.join(', ')}`);
    console.error('❌ This credentials file is incomplete');
    process.exit(1);
  }

  requiredFields.forEach(field => {
    console.log(`✅ ${field}: ${field === 'private_key' ? '***' : credJson[field]}`);
  });

  // Check project ID
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (projectId && projectId !== credJson.project_id) {
    console.warn(`⚠️  Project ID mismatch:`);
    console.warn(`   .env: ${projectId}`);
    console.warn(`   Key file: ${credJson.project_id}`);
    console.warn(`   Using: ${credJson.project_id} (from key file)`);
  } else {
    console.log(`✅ Project ID: ${credJson.project_id}`);
  }

  console.log('\n✅ All checks passed! Your credentials are properly configured.');
  console.log('✅ You can now use the OCR service.\n');

} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('❌ Credentials file is not valid JSON');
    console.error(`❌ Error: ${error.message}`);
  } else {
    console.error(`❌ Error reading credentials: ${error.message}`);
  }
  process.exit(1);
}

