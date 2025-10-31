# 🔑 Where to Get Service Account Key - Step by Step

## ⚡ Quick Links (Your Project)

- **Create Service Account**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001
- **Enable Vision API**: https://console.cloud.google.com/apis/library/vision.googleapis.com?project=gen-lang-client-0534376001

---

## 📋 Detailed Steps with Screenshots Guide

### Step 1: Go to Service Accounts Page

**Click this link** (already filtered for your project):
👉 https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001

You'll see a page with service accounts (might be empty if this is your first time).

### Step 2: Create New Service Account

1. Click the **"+ CREATE SERVICE ACCOUNT"** button at the top
2. Fill in:
   - **Service account name**: `vision-api-service` (or any name you like)
   - **Service account ID**: Will auto-fill (keep the default)
   - **Description** (optional): "For Cloud Vision API OCR"
3. Click **"CREATE AND CONTINUE"**

### Step 3: Grant Permissions

1. In the **"Grant this service account access to project"** section:
   - Click the **"Select a role"** dropdown
   - Type: `Cloud Vision API User`
   - Select: **"Cloud Vision API User"** from the list
2. Click **"CONTINUE"**

### Step 4: Skip Optional Steps

1. Click **"DONE"** (you can skip granting users access)

You'll now see your service account in the list!

### Step 5: Create the Key (JSON File)

1. **Click on your service account** name (`vision-api-service`)
2. Go to the **"KEYS"** tab (at the top of the page)
3. Click **"ADD KEY"** dropdown button
4. Select **"Create new key"**
5. **Select "JSON"** format
6. Click **"CREATE"**

### Step 6: Download the Key

- The JSON file will **automatically download** to your Downloads folder
- It will have a name like: `gen-lang-client-0534376001-xxxxxxxxxxxx.json`

### Step 7: Move and Rename the File

1. **Find the downloaded file** in your Downloads folder
2. **Rename it** to: `service-account-key.json`
3. **Move/copy it** to: `C:\Projects\StablePay2.0\backend\` folder
   - It should be in the same folder as `server.js`

---

## ✅ Verify the Key File

Open `service-account-key.json` - it should look like this:

```json
{
  "type": "service_account",
  "project_id": "gen-lang-client-0534376001",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "vision-api-service@gen-lang-client-0534376001.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Key things to check:**
- ✅ `"type": "service_account"` ← Must be this!
- ✅ `"client_email"` field exists
- ✅ `"private_key"` field exists
- ✅ `"project_id": "gen-lang-client-0534376001"`

---

## 🔧 Step 8: Update Your .env File

Open `backend/.env` and update:

```env
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=gen-lang-client-0534376001
```

**Delete the line**:
```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"web":{...}}
```

---

## 🌐 Step 9: Enable Vision API

**Click this link**:
👉 https://console.cloud.google.com/apis/library/vision.googleapis.com?project=gen-lang-client-0534376001

1. Click the **"ENABLE"** button
2. Wait a few seconds for it to enable

---

## ✅ Step 10: Test It

Run this command:
```bash
cd backend
npm run check-creds
```

If everything is correct, you'll see:
```
✅ All checks passed! Your credentials are properly configured.
```

Then restart your server:
```bash
npm run dev
```

Look for:
```
✅ Google Cloud service account credentials loaded from: ...
✅ Service account email: vision-api-service@...
✅ Google Cloud Vision API client initialized successfully
```

---

## ❌ Troubleshooting

### "I don't see Service Accounts option"
- Make sure you're in the correct project: `gen-lang-client-0534376001`
- Check the project selector at the top of the page

### "Download didn't work"
- Check your browser's download folder
- Try right-clicking and "Save link as..."

### "File has wrong format"
- Make sure you selected **JSON** format (not P12)
- File should start with `{"type":"service_account",...}`
- **NOT** `{"web":{...}}` ← That's OAuth secret (wrong!)

### "Permission denied errors"
- Make sure you granted **"Cloud Vision API User"** role
- Make sure Vision API is enabled

---

## 📞 Still Stuck?

1. Run: `npm run check-creds` - it will tell you exactly what's wrong
2. Check: `backend/FIX-NOW.md` for more details
3. Make sure Vision API is enabled (Step 9 above)

---

## 🎯 Summary - Just the Links:

1. **Get Key**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001
2. **Enable API**: https://console.cloud.google.com/apis/library/vision.googleapis.com?project=gen-lang-client-0534376001

