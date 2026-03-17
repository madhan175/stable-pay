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
    console.log(`✅ Accepted (BYPASS) for ${phone} with code: ${otp}`);
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
