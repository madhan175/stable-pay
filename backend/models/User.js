const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['national_id', 'passport', 'driving_license', 'pan_card'],
    required: true
  },
  file_url: {
    type: String,
    required: true
  },
  ocr_data: {
    name: String,
    dob: Date,
    id_number: String,
    country: String,
    extracted_text: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  verified_at: Date,
  rejection_reason: String
});

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  kyc_status: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },
  kyc_documents: [kycDocumentSchema],
  wallet_address: String,
  country_detected: String,
  ip_address: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: Date
});

module.exports = mongoose.model('User', userSchema);
