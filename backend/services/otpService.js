// services/otpService.js
// Fake OTP service (for development / testing)

const otpStore = new Map();

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  async sendOTP(phone) {
    try {
      const otp = generateOTP();
      const expires = Date.now() + 5 * 60 * 1000; // 5 min expiry

      // Save in memory
      otpStore.set(phone, { otp, expires });

      // Log for debugging
      console.log(`📱 [FAKE OTP] Generated for ${phone}: ${otp}`);

      // Return response (OTP included for testing)
      return {
        success: true,
        otp, // ⚠️ Only return OTP in dev mode
        expiresAt: expires,
        message: "Fake OTP generated (no SMS sent)"
      };
    } catch (error) {
      console.error("❌ Fake OTP error:", error.message);
      return { success: false, error: error.message };
    }
  },

  async verifyOTP(phone, otp) {
    // 🔑 Shortcut OTP "123456" always works for testing
    if (otp === "123456") {
      console.log(`✅ [FAKE OTP] Shortcut OTP accepted for ${phone}`);
      return { success: true, message: "OTP verified successfully (shortcut)" };
    }

    const entry = otpStore.get(phone);
    if (!entry) return { success: false, message: "No OTP found" };

    if (entry.expires < Date.now()) {
      otpStore.delete(phone);
      return { success: false, message: "OTP expired" };
    }

    // Check real OTP
    if (entry.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    otpStore.delete(phone);
    return { success: true, message: "OTP verified successfully" };
  },

  cleanupExpiredOTPs() {
    for (let [phone, entry] of otpStore.entries()) {
      if (entry.expires <= Date.now()) {
        otpStore.delete(phone);
      }
    }
  },
};
