# How to Fix Google Cloud Vision API Credentials Error

## Problem
You're seeing this error:
```
Failed to extract text from image: 2 UNKNOWN: Getting metadata from plugin failed with error: key must be a string, a buffer or an object
```

This happens because you're using an **OAuth client secret** file instead of a **Service Account Key** file.

## Solution

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**
5. Fill in:
   - **Service account name**: `vision-api-ocr` (or any name)
   - **Service account ID**: Auto-generated
   - **Description**: `Service account for OCR document processing`
6. Click **CREATE AND CONTINUE**

### Step 2: Grant Permissions

1. In **Grant this service account access to project**:
   - Select role: **Cloud Vision API User**
   - You can also add: **Service Account User** (if needed)
2. Click **CONTINUE** then **DONE**

### Step 3: Create and Download Service Account Key

1. Find your newly created service account in the list
2. Click on it to open details
3. Go to the **KEYS** tab
4. Click **ADD KEY** > **Create new key**
5. Select **JSON** format
6. Click **CREATE**
7. The JSON file will automatically download

### Step 4: Verify the Key File Format

The downloaded JSON file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "vision-api-ocr@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Important**: It must have:
- ✅ `"type": "service_account"` (at the root)
- ✅ `"private_key"` field
- ✅ `"project_id"` field

**Not**:
- ❌ `"web"` or `"installed"` at root (this is OAuth client secret)

### Step 5: Enable Cloud Vision API

1. Go to [APIs & Services](https://console.cloud.google.com/apis/library) in Google Cloud Console
2. Search for **Cloud Vision API**
3. Click on it and click **ENABLE**

### Step 6: Update Your Configuration

1. Move the downloaded service account key JSON file to your `backend/` folder
2. Rename it to something like `service-account-key.json` (or keep the auto-generated name)
3. Update your `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
```

Replace `your-project-id-here` with your actual Google Cloud project ID (found in the JSON file or in Google Cloud Console).

### Step 7: Restart Your Server

```bash
cd backend
npm start
```

You should now see:
```
✅ Google Cloud service account credentials loaded from: /path/to/service-account-key.json
✅ Google Cloud Vision API client initialized successfully
```

## Alternative: Using Environment Variable (For Deployment)

If you're deploying to platforms like Heroku, Railway, or similar, you can set the service account key as an environment variable:

1. Read the entire JSON file content
2. Set it as an environment variable (as a single-line JSON string):

```env
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

**Note**: Make sure to escape quotes properly if setting via command line or dashboard.

## Troubleshooting

### Still Getting Errors?

1. **Check the file path**: Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to the correct file
2. **Verify JSON format**: Open the file and ensure it's valid JSON
3. **Check permissions**: Ensure the service account has "Cloud Vision API User" role
4. **Verify API is enabled**: Make sure Cloud Vision API is enabled in your project
5. **Check billing**: Cloud Vision API requires a billing account (free tier available)

### Error: "Permission denied"

- Ensure the service account has the **Cloud Vision API User** role
- Verify Cloud Vision API is enabled

### Error: "Quota exceeded"

- Check your Google Cloud quota limits
- Wait a bit and try again
- Consider upgrading your plan if needed

## Security Note

⚠️ **Never commit service account keys to version control!**

1. Add `*.json` (or specifically your key file) to `.gitignore`
2. Use environment variables in production
3. Rotate keys if accidentally committed

## Testing

### Quick Diagnostic Check

Run this diagnostic script to verify your credentials:

```bash
cd backend
node scripts/check-credentials.js
```

This will check:
- ✅ File exists and is readable
- ✅ Valid JSON format
- ✅ Correct file type (service account key, not OAuth secret)
- ✅ All required fields are present (type, project_id, private_key, client_email)

### Test OCR Upload

After setup, test by uploading a document through your KYC upload interface. You should see real-time OCR processing without errors.

If you see the error: **"The incoming JSON object does not contain a client_email field"**

This means:
1. ❌ Your credentials file is missing the `client_email` field
2. ❌ You may have downloaded an incomplete or corrupted file
3. ❌ The file might still be an OAuth client secret instead of a service account key

**Solution**: Run the diagnostic script above and download a fresh service account key from Google Cloud Console.

