# 🔑 Understanding Google Cloud Credentials

## The Problem: Two Different Types of Credentials

Google Cloud uses **TWO different types** of credentials for different purposes:

---

## ❌ OAuth Client Secret (What You Have Now - WRONG for this use case)

**File name pattern:** `client_secret_*.json`

**What it looks like:**
```json
{
  "web": {
    "client_id": "81825525579-...",
    "client_secret": "GOCSPX-...",
    "redirect_uris": ["..."],
    "javascript_origins": ["..."]
  }
}
```

**Used for:** Web applications that need user authentication (OAuth login flows)

**NOT suitable for:** Server-to-server API calls (like Vision API)

**How you get it:** APIs & Services → Credentials → OAuth 2.0 Client IDs

---

## ✅ Service Account Key (What You NEED - CORRECT for this use case)

**File name pattern:** `service-account-key.json` or `*-xxxxxxxxxxxx.json`

**What it looks like:**
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

**Used for:** Server-to-server API access (like Cloud Vision API, Cloud Storage, etc.)

**Perfect for:** Backend services that need to call Google APIs without user interaction

**How you get it:** IAM & Admin → Service Accounts → Keys → Create Key → JSON

---

## 🔍 Quick Visual Comparison

| Feature | OAuth Client Secret | Service Account Key |
|---------|-------------------|-------------------|
| **First field** | `"web"` or `"installed"` | `"type": "service_account"` |
| **Has `client_email`?** | ❌ No | ✅ Yes |
| **Has `private_key`?** | ❌ No | ✅ Yes |
| **File name** | `client_secret_*.json` | `*-*.json` or custom name |
| **Use case** | User authentication | Server APIs |
| **Works with Vision API?** | ❌ NO | ✅ YES |

---

## 📋 Which One Do You Need?

For **StablePay2.0 KYC OCR service**, you need:
- ✅ **Service Account Key** ← THIS ONE

You currently have:
- ❌ **OAuth Client Secret** ← WRONG TYPE

---

## 🎯 Action Required

Follow the instructions in **FIX-NOW.md** to:
1. Create a Service Account
2. Download the Service Account Key (JSON)
3. Replace the OAuth Client Secret in your configuration

---

## 💡 Why This Matters

The Cloud Vision API needs to authenticate your **backend server** (not a user's browser), so it requires a Service Account Key that gives your server permission to call the API.

The OAuth Client Secret is designed for authenticating **users** in web browsers, which is why it doesn't work for server-side API calls.

