const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const LedgerEntry = require("../models/LedgerEntry");
const { v4: uuidv4 } = require("uuid");

const secret = process.env.PAYSTACK_SECRET_KEY;

router.post("/paystack", async (req, res) => {
  try {
    // 1. Validate Signature
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    console.log("Paystack Webhook Received:", event.event);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (event.event === 'charge.success') {
        const { reference, amount } = event.data;
        const tx = await Transaction.findOne({ reference }).session(session);

        if (tx && tx.status === 'pending') {
          const account = await Account.findOne({ userId: tx.userId }).session(session);
          const balanceBefore = account.balance;
          account.balance += tx.amount;
          const balanceAfter = account.balance;
          await account.save({ session });

          tx.status = 'completed';
          tx.description = tx.description.replace("PENDING: ", "");
          await tx.save({ session });

          await new LedgerEntry({
            transactionId: tx._id,
            walletId: account._id,
            type: 'CREDIT',
            amount: tx.amount,
            balanceBefore,
            balanceAfter,
            description: `Deposit via Paystack (Webhook): ${tx.description}`,
            entryGroup: uuidv4()
          }).save({ session });
        }
      }

      if (event.event === 'transfer.success') {
        const { reference } = event.data;
        const tx = await Transaction.findOne({ reference }).session(session);
        if (tx && tx.status === 'processing') {
          tx.status = 'completed';
          await tx.save({ session });
        }
      }

      if (event.event === 'transfer.failed' || event.event === 'transfer.reversed') {
        const { reference } = event.data;
        const tx = await Transaction.findOne({ reference }).session(session);
        
        if (tx && tx.status === 'processing') {
          // REVERSAL LOGIC
          const account = await Account.findOne({ userId: tx.userId }).session(session);
          const balanceBefore = account.balance;
          account.balance += Math.abs(tx.amount); // Refund
          const balanceAfter = account.balance;
          await account.save({ session });

          tx.status = 'reversed';
          tx.description = `FAILED: ${tx.description}`;
          await tx.save({ session });

          await new LedgerEntry({
            transactionId: tx._id,
            walletId: account._id,
            type: 'CREDIT', // Reversal credit
            amount: Math.abs(tx.amount),
            balanceBefore,
            balanceAfter,
            description: `Reversal for failed withdrawal: ${reference}`,
            entryGroup: uuidv4()
          }).save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();
      res.sendStatus(200);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
