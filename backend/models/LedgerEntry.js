const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  transactionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction', 
    required: true,
    index: true 
  },
  walletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['DEBIT', 'CREDIT'], 
    required: true 
  },
  amount: { 
    type: Number, // Absolute positive value
    required: true 
  },
  balanceBefore: { 
    type: Number, 
    required: true 
  },
  balanceAfter: { 
    type: Number, 
    required: true 
  },
  description: {
    type: String,
    required: true
  },
  entryGroup: {
    type: String, // UUID to link the two sides of a double-entry transaction
    required: true,
    index: true
  }
}, { timestamps: true });

// Prevent accidental deletion or modification of ledger entries
ledgerEntrySchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Ledger entries are immutable and cannot be modified.'));
  }
  next();
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
