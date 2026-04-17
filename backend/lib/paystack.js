const axios = require("axios");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = "https://api.paystack.co";

const paystack = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

module.exports = {
  /**
   * Fetch list of banks in Ghana
   */
  async getBanks() {
    try {
      const response = await paystack.get("/bank?country=ghana");
      return response.data.data; // List of banks
    } catch (error) {
      console.error("Paystack getBanks error:", error.response?.data || error.message);
      throw new Error("Failed to fetch bank list from Paystack.");
    }
  },

  /**
   * Initialize a transaction (Deposit)
   */
  async initializeTransaction(email, amount, metadata = {}) {
    try {
      const response = await paystack.post("/transaction/initialize", {
        email,
        amount: amount * 100, // Convert to pesewas/kobo
        currency: "GHS",
        metadata,
      });
      return response.data.data; // { authorization_url, access_code, reference }
    } catch (error) {
      console.error("Paystack initialize error:", error.response?.data || error.message);
      throw new Error("Failed to initialize transaction.");
    }
  },

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await paystack.get(`/transaction/verify/${reference}`);
      return response.data.data;
    } catch (error) {
      console.error("Paystack verify error:", error.response?.data || error.message);
      throw new Error("Failed to verify transaction.");
    }
  },

  /**
   * Create a transfer recipient (for Withdrawals)
   */
  async createTransferRecipient(name, accountNumber, bankCode, type = "ghipss") {
    try {
      // type: 'ghipss' for bank accounts, 'mobile_money' for MoMo in Ghana
      const response = await paystack.post("/transferrecipient", {
        type,
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "GHS",
      });
      return response.data.data; // { recipient_code, ... }
    } catch (error) {
      console.error("Paystack createRecipient error:", error.response?.data || error.message);
      throw new Error("Failed to create transfer recipient.");
    }
  },

  /**
   * Initiate a transfer (Withdrawal)
   */
  async initiateTransfer(amount, recipientCode, reason = "Withdrawal") {
    try {
      const response = await paystack.post("/transfer", {
        source: "balance",
        amount: amount * 100,
        recipient: recipientCode,
        reason,
        currency: "GHS",
      });
      return response.data.data;
    } catch (error) {
      console.error("Paystack initiateTransfer error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to initiate transfer.");
    }
  },
};
