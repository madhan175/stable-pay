# 🔧 FIX YOUR GOOGLE CLOUD CREDENTIALS - Step by Step

## ❌ Current Problem

You have an **OAuth Client Secret** file, but you need a **Service Account Key** file. These are TWO DIFFERENT things!

- **OAuth Client Secret** (`client_secret_*.json`) = For user authentication (NOT what you need)
- **Service Account Key** (`service-account-key.json`) = For server-to-server API access (THIS is what you need)

---

## 📋 Complete Solution - Follow These Steps EXACTLY

### **Step 1: Go to Google Cloud Console**

Open your browser and go to:
👉 **https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001**

(If the link doesn't work, manually go to Google Cloud Console → IAM & Admin → Service Accounts)

---

### **Step 2: Create a Service Account**

1. Click the **"+ CREATE SERVICE ACCOUNT"** button (blue button at the top)
2. Fill in:
   - **Service account name**: `vision-api-service`
   - **Description** (optional): `For Cloud Vision API OCR`
3. Click **"CREATE AND CONTINUE"**

---

### **Step 3: Grant Permissions**

1. In the **"Grant this service account access to project"** section:
   - Click **"Select a role"** dropdown
   - Search for: `Cloud Vision API User`
   - Select **"Cloud Vision API User"** from the list
2. Click **"CONTINUE"**
3. Click **"DONE"** (you can skip the optional step)

---

### **Step 4: Create and Download the Key File**

1. You'll see your new service account in the list
2. **Click on the service account name** (`vision-api-service`)
3. Go to the **"KEYS"** tab (at the top)
4. Click **"ADD KEY"** → **"Create new key"**
5. **Select "JSON"** (NOT P12!)
6. Click **"CREATE"**

📥 **A JSON file will automatically download** to your Downloads folder
- File name will look like: `gen-lang-client-0534376001-xxxxxxxxxxxx.json`

---

### **Step 5: Move and Rename the File**

1. **Go to your Downloads folder** and find the downloaded JSON file
2. **Rename it** to: `service-account-key.json`
3. **Move/copy it** to: `C:\Projects\StablePay2.0\backend\`
   - The file should be in the same folder as `server.js`
   - Full path should be: `C:\Projects\StablePay2.0\backend\service-account-key.json`

---

### **Step 6: Verify the File Format**

**Open** `service-account-key.json` in a text editor (like Notepad or VS Code).

✅ **It should start with:**
```json
{
  "type": "service_account",
  "project_id": "gen-lang-client-0534376001",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "vision-api-service@gen-lang-client-0534376001.iam.gserviceaccount.com",
  ...
}
```

❌ **It should NOT have:**
```json
{
  "web": { ... }
}
```
If it has `"web"` or `"installed"`, that's the wrong file type!

---

### **Step 7: Update Your .env File**

1. Go to: `C:\Projects\StablePay2.0\backend\.env`
2. **Find this line:**
   ```
   GOOGLE_APPLICATION_CREDENTIALS=client_secret_81825525579-tms8bs0cf6nr9f38ia2k4v8l6bm41h99.apps.googleusercontent.com.json
   ```
3. **Change it to:**
   ```
   GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
   ```
4. **Make sure this line exists:**
   ```
   GOOGLE_CLOUD_PROJECT_ID=gen-lang-client-0534376001
   ```
5. **Save the file**

---

### **Step 8: Delete the Old OAuth Client Secret File (Optional)**

You can delete or move this file (you don't need it anymore):
- `client_secret_81825525579-tms8bs0cf6nr9f38ia2k4v8l6bm41h99.apps.googleusercontent.com.json`

⚠️ **Keep it if you need OAuth for other features, but it won't work for Vision API.**

---

### **Step 9: Enable Cloud Vision API**

1. Go to: **https://console.cloud.google.com/apis/library/vision.googleapis.com?project=gen-lang-client-0534376001**
2. Click the **"ENABLE"** button
3. Wait a few seconds for it to enable

---

### **Step 10: Test Your Configuration**

1. Open PowerShell
2. Navigate to the backend folder:
   ```powershell
   cd C:\Projects\StablePay2.0\backend
   ```
3. Run the check command:
   ```powershell
   npm run check-creds
   ```

✅ **If successful, you should see:**
```
✅ .env file found
✅ GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
✅ Credentials file found: C:\Projects\StablePay2.0\backend\service-account-key.json
✅ Credentials type: service_account
✅ client_email: vision-api-service@...
✅ private_key: ***
✅ project_id: gen-lang-client-0534376001

✅ All checks passed! Your credentials are properly configured.
```

---

## ❌ Troubleshooting

### Error: "Credentials file not found"
- Make sure the file is named exactly: `service-account-key.json`
- Make sure it's in `C:\Projects\StablePay2.0\backend\` folder
- Check for typos in `.env` file

### Error: "This is an OAuth client secret"
- You downloaded the wrong file type
- Make sure you selected **JSON** (not P12) when creating the key
- The file should have `"type": "service_account"` (NOT `"web"`)

### Error: "Missing required fields"
- The downloaded JSON file might be corrupted
- Download a new key from Google Cloud Console

### Error: "Permission denied" or "403"
- Go back to Step 3 and make sure you granted **"Cloud Vision API User"** role
- Make sure Vision API is enabled (Step 9)

---

## 🎯 Quick Reference - What You Need

| Item | What It Is | Where to Get It |
|------|-----------|-----------------|
| Service Account Key | JSON file with credentials | Google Cloud Console → Service Accounts → Keys |
| File Name | `service-account-key.json` | Rename downloaded file |
| File Location | `C:\Projects\StablePay2.0\backend\` | Move from Downloads |
| .env Setting | `GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json` | Edit `.env` file |

---

## 📞 Still Having Issues?

1. **Double-check** all steps above
2. **Run** `npm run check-creds` again
3. **Read** the error message carefully - it tells you exactly what's wrong
4. **Verify** the JSON file has `"type": "service_account"` (not `"web"`)

---

## ✅ Summary Checklist

- [ ] Created service account in Google Cloud Console
- [ ] Granted "Cloud Vision API User" role
- [ ] Downloaded JSON key file
- [ ] Renamed file to `service-account-key.json`
- [ ] Moved file to `backend/` folder
- [ ] Updated `.env` file with correct path
- [ ] Enabled Cloud Vision API
- [ ] Ran `npm run check-creds` successfully
- [ ] All checks passed ✅

---

**After completing all steps, your OCR service will work!** 🎉

