# Google Cloud Vision API Setup Guide

## ⚠️ Important: Service Account Key Required

Google Cloud Vision API requires a **SERVICE ACCOUNT KEY**, NOT an OAuth client secret.

The file `client_secret_*.json` is an OAuth client secret and will NOT work with Vision API.

## Step-by-Step Setup

### 1. Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **IAM & Admin** > **Service Accounts**
   - Direct link: https://console.cloud.google.com/iam-admin/serviceaccounts

### 2. Create or Select Service Account

1. Click **+ CREATE SERVICE ACCOUNT**
2. Enter a name (e.g., "vision-api-service")
3. Click **CREATE AND CONTINUE**
4. Grant role: **Cloud Vision API User** or **Editor** (for full access)
5. Click **CONTINUE** then **DONE**

### 3. Create Service Account Key

1. Find your service account in the list
2. Click on it to open details
3. Go to **KEYS** tab
4. Click **ADD KEY** > **Create new key**
5. Select **JSON** format
6. Click **CREATE** - this will download a JSON file

### 4. Enable Cloud Vision API

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Cloud Vision API"
3. Click on it and press **ENABLE**

### 5. Configure Your Backend

1. Move the downloaded JSON file to the `backend/` folder
2. Rename it to something like `service-account-key.json`
3. Open `backend/.env` (or create it from `env.example`)
4. Add these lines:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

### 6. Verify Service Account Key Format

Your service account key JSON should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "vision-api-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Key Fields:**
- ✅ `type`: Must be `"service_account"`
- ✅ `client_email`: Service account email (must exist)
- ✅ `private_key`: Private key (must exist)
- ✅ `project_id`: Your Google Cloud project ID

### 7. Restart Your Backend Server

After configuring, restart your backend:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Google Cloud service account credentials loaded from: ...
✅ Service account email: vision-api-service@...
✅ Google Cloud Vision API client initialized successfully
```

## Troubleshooting

### Error: "does not contain a client_email field"

**Cause:** You're using an OAuth client secret instead of a service account key.

**Solution:** 
1. Delete the `client_secret_*.json` file (it's not needed)
2. Follow the steps above to create a proper service account key
3. Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to the service account key file

### Error: "Failed to initialize Vision API client"

**Causes:**
1. Missing required fields in the JSON
2. File path is incorrect
3. Cloud Vision API not enabled
4. Service account doesn't have proper permissions

**Solutions:**
1. Verify the JSON has all required fields (see format above)
2. Check `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`
3. Enable Cloud Vision API in Google Cloud Console
4. Grant the service account proper IAM roles

### Error: "permission denied" or "403"

**Cause:** Service account doesn't have Vision API permissions.

**Solution:**
1. Go to IAM & Admin > Service Accounts
2. Click your service account
3. Go to PERMISSIONS tab
4. Add role: **Cloud Vision API User**

## Alternative: Use Environment Variable

For deployment (Heroku, Railway, etc.), you can set credentials as an environment variable:

```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

⚠️ **Never commit service account keys to Git!** Add them to `.gitignore`.

