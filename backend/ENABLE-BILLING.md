# 💳 Enable Billing for Google Cloud Vision API

## ⚠️ Current Error

You're seeing this error:
```
PERMISSION_DENIED: This API method requires billing to be enabled
```

**This is NOT a credentials problem** - your credentials are working fine! ✅

The Cloud Vision API requires **billing to be enabled** even to use the free tier.

---

## ✅ Solution: Enable Billing

### **Step 1: Go to Billing Setup**

**Direct Link (Your Project):**
👉 **https://console.cloud.google.com/billing?project=gen-lang-client-0534376001**

**Alternative Link:**
👉 **https://console.developers.google.com/billing/enable?project=81825525579**

---

### **Step 2: Link a Billing Account**

1. You'll be prompted to either:
   - **Link an existing billing account** (if you have one)
   - **Create a new billing account** (if this is your first time)

2. **If creating a new billing account:**
   - Click **"CREATE BILLING ACCOUNT"**
   - Fill in your billing information (credit card, etc.)
   - Select your country/region
   - Accept the terms
   - Click **"SUBMIT AND ENABLE BILLING"**

3. **If linking existing account:**
   - Select your billing account from the list
   - Click **"SET ACCOUNT"**

---

### **Step 3: Wait a Few Minutes**

After enabling billing:
- Wait **2-5 minutes** for the changes to propagate
- Then try your OCR upload again

---

## 💰 Free Tier Information

**Good News:** Cloud Vision API has a **FREE tier**:
- ✅ **First 1,000 requests per month are FREE**
- ✅ **After that:** $1.50 per 1,000 requests
- ✅ **You won't be charged** unless you exceed the free tier

Most small applications stay within the free tier!

---

## 🔍 Verify Billing is Enabled

1. Go to: **https://console.cloud.google.com/billing?project=gen-lang-client-0534376001**
2. You should see:
   - ✅ Your project listed
   - ✅ A billing account linked
   - ✅ Status: "Billing enabled"

---

## ⚠️ Troubleshooting

### "I don't see a billing option"
- Make sure you're signed in with an account that has billing permissions
- Check that you're viewing the correct project: `gen-lang-client-0534376001`

### "Payment method declined"
- Use a valid credit/debit card
- Check with your bank if international payments are allowed
- Some prepaid cards may not work

### "Still getting billing error after enabling"
- Wait 5-10 minutes for changes to propagate
- Restart your backend server
- Verify billing is actually enabled in the console

---

## ✅ After Enabling Billing

1. **Wait 2-5 minutes**
2. **Restart your backend server:**
   ```powershell
   cd C:\Projects\StablePay2.0\backend
   npm run dev
   ```
3. **Try uploading a document again**
4. **You should see:** OCR working successfully! ✅

---

## 📋 Quick Checklist

- [ ] Opened billing page
- [ ] Created or linked billing account
- [ ] Added payment method
- [ ] Enabled billing for project
- [ ] Waited 2-5 minutes
- [ ] Restarted backend server
- [ ] Tested OCR upload

---

## 🎯 Direct Links

- **Enable Billing:** https://console.cloud.google.com/billing?project=gen-lang-client-0534376001
- **Check Billing Status:** https://console.cloud.google.com/billing?project=gen-lang-client-0534376001
- **Vision API Usage:** https://console.cloud.google.com/apis/api/vision.googleapis.com/metrics?project=gen-lang-client-0534376001

---

**Note:** You'll only be charged if you exceed the free tier (1,000 requests/month). For development and testing, you'll likely stay within the free tier! 🎉

