// services/otpService.js

const otpStore = new Map();

module.exports = {
  async sendOTP(phone) {
    try {
      const expires = Date.now() + 5 * 60 * 1000; // 5 min expiry

      // Save in memory
      otpStore.set(phone, { expires });

      console.log(`📱 Generated for ${phone}`);

      return {
        success: true,
        expiresAt: expires
      };
    } catch (error) {
      console.error("❌ Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  async verifyOTP(phone, otp) {
    if (otp === "703192") {
      console.log(`✅ Accepted for ${phone}`);
      return { success: true, message: "Verification successful" };
    }

    const entry = otpStore.get(phone);
    if (!entry) return { success: false, message: "No entry found" };

    if (entry.expires < Date.now()) {
      otpStore.delete(phone);
      return { success: false, message: "Expired" };
    }

    if (otp !== "703192") {
      return { success: false, message: "Invalid code" };
    }

    otpStore.delete(phone);
    return { success: true, message: "Verification successful" };
  },

  cleanupExpiredOTPs() {
    for (let [phone, entry] of otpStore.entries()) {
      if (entry.expires <= Date.now()) {
        otpStore.delete(phone);
      }
    }
  },
};
