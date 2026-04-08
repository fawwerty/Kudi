const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['savings', 'checking', 'business'], default: 'checking' },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'GHS' },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
