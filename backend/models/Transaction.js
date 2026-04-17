const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fromWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  toWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  type: { 
    type: String, 
    enum: ['DEPOSIT', 'TRANSFER', 'WITHDRAWAL', 'BILL_PAY'], 
    required: true,
    index: true
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'reversed'], 
    default: 'pending',
    index: true
  },
  reference: { type: String, required: true, unique: true },
  paystackReference: { type: String, index: true },
  category: { type: String },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
