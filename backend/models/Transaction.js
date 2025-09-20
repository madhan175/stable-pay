const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient_wallet: {
    type: String,
    required: true
  },
  amount_inr: {
    type: Number,
    required: true
  },
  amount_usd: {
    type: Number,
    required: true
  },
  amount_usdt: {
    type: Number,
    required: true
  },
  requires_kyc: {
    type: Boolean,
    default: false
  },
  kyc_verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'completed', 'blocked', 'failed'],
    default: 'created'
  },
  tx_hash: String,
  block_number: Number,
  gas_used: Number,
  created_at: {
    type: Date,
    default: Date.now
  },
  completed_at: Date,
  error_message: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
