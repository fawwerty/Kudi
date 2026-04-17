const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const LedgerEntry = require('../models/LedgerEntry');
const Account = require('../models/Account');
const { v4: uuidv4 } = require('uuid');

/**
 * Perform a double-entry ledger operation within a session
 */
async function recordTransfer({
  senderId, // User ID of sender (optional for DEPOSIT)
  recipientId, // User ID of recipient (optional for WITHDRAWAL)
  amount,
  type, // DEPOSIT, TRANSFER, WITHDRAWAL, BILL_PAY
  reference,
  description,
  session
}) {
  const entryGroup = uuidv4();

  // 1. Fetch Accounts
  const senderAccount = senderId ? await Account.findOne({ userId: senderId }).session(session) : null;
  const recipientAccount = recipientId ? await Account.findOne({ userId: recipientId }).session(session) : null;

  if (senderId && !senderAccount) throw new Error("Sender account not found.");
  if (recipientId && !recipientAccount) throw new Error("Recipient account not found.");

  // 2. Validate Sender Balance for DEBIT
  if (senderAccount && senderAccount.balance < amount) {
    throw new Error("Insufficient funds for this transaction.");
  }

  // 3. Create THE Transaction record (Master intent)
  const tx = new Transaction({
    userId: senderId || recipientId, // Primary actor
    fromWalletId: senderAccount?._id,
    toWalletId: recipientAccount?._id,
    type,
    amount,
    status: 'completed',
    reference,
    description
  });
  await tx.save({ session });

  // 4. DEBIT SIDE (Sender)
  if (senderAccount) {
    const balanceBefore = senderAccount.balance;
    senderAccount.balance -= amount;
    const balanceAfter = senderAccount.balance;
    await senderAccount.save({ session });

    await new LedgerEntry({
      transactionId: tx._id,
      walletId: senderAccount._id,
      type: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Debit for ${type}: ${description}`,
      entryGroup
    }).save({ session });
  }

  // 5. CREDIT SIDE (Recipient)
  if (recipientAccount) {
    const balanceBefore = recipientAccount.balance;
    recipientAccount.balance += amount;
    const balanceAfter = recipientAccount.balance;
    await recipientAccount.save({ session });

    await new LedgerEntry({
      transactionId: tx._id,
      walletId: recipientAccount._id,
      type: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Credit for ${type}: ${description}`,
      entryGroup
    }).save({ session });
  }

  return tx;
}

module.exports = { recordTransfer };
