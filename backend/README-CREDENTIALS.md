# 📚 Google Cloud Credentials Documentation

## ⚡ Quick Start - Fix Your Credentials

**If you're getting an error about OAuth client secret**, follow this:

👉 **Read: [FIX-NOW.md](./FIX-NOW.md)** - Complete step-by-step fix guide

---

## 📖 All Documentation Files

### 1. **FIX-NOW.md** ⭐ **START HERE**
- **Purpose:** Complete step-by-step solution to fix your credentials
- **When to use:** You have an error and need to fix it immediately
- **Content:** 10 detailed steps with links, troubleshooting, and checklist

### 2. **CREDENTIALS-EXPLAINED.md**
- **Purpose:** Explains the difference between OAuth Client Secret and Service Account Key
- **When to use:** You want to understand WHY you're getting the error
- **Content:** Visual comparisons, use cases, quick reference

### 3. **SETUP-GOOGLE-CREDENTIALS.md**
- **Purpose:** Detailed setup guide with troubleshooting
- **When to use:** First-time setup or deep troubleshooting
- **Content:** Comprehensive guide with alternative methods

### 4. **GET-KEY-STEPS.md**
- **Purpose:** Step-by-step guide with project-specific links
- **When to use:** You prefer visual step-by-step instructions
- **Content:** Numbered steps with direct links to your project

---

## 🎯 Which File Should I Read?

| Situation | Read This File |
|-----------|---------------|
| **I have an error right now** | [FIX-NOW.md](./FIX-NOW.md) |
| **I want to understand the difference** | [CREDENTIALS-EXPLAINED.md](./CREDENTIALS-EXPLAINED.md) |
| **I'm doing first-time setup** | [SETUP-GOOGLE-CREDENTIALS.md](./SETUP-GOOGLE-CREDENTIALS.md) |
| **I prefer visual step-by-step** | [GET-KEY-STEPS.md](./GET-KEY-STEPS.md) |

---

## ✅ Quick Checklist

After following the instructions, verify:

1. ✅ Service account created in Google Cloud Console
2. ✅ Service account has "Cloud Vision API User" role
3. ✅ Service account key downloaded (JSON format)
4. ✅ File renamed to `service-account-key.json`
5. ✅ File placed in `backend/` folder
6. ✅ `.env` file updated with correct path
7. ✅ Cloud Vision API enabled
8. ✅ `npm run check-creds` passes all checks

---

## 🔗 Important Links

- **Create Service Account:** https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0534376001
- **Enable Vision API:** https://console.cloud.google.com/apis/library/vision.googleapis.com?project=gen-lang-client-0534376001

---

## 🛠️ Verification Command

```bash
cd backend
npm run check-creds
```

This command will tell you exactly what's wrong and what to fix!

