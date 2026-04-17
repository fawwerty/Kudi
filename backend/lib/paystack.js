const axios = require("axios");

// Removed fixed assignment to allow dynamic loading from process.env
const BASE_URL = "https://api.paystack.co";

const getPaystackClient = () => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.warn("⚠️ PAYSTACK_SECRET_KEY is missing from environment variables.");
  }
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
  });
};

module.exports = {
  /**
   * Fetch list of banks in Ghana
   */
  async getBanks() {
    try {
      const client = getPaystackClient();
      const response = await client.get("/bank?country=ghana");
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
      if (!email) throw new Error("Email is required for Paystack initialization.");
      const client = getPaystackClient();
      const response = await client.post("/transaction/initialize", {
        email,
        amount: Math.round(amount * 100), // Ensure integer (pesewas/kobo)
        currency: "GHS",
        metadata,
      });
      return response.data.data; // { authorization_url, access_code, reference }
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Paystack initialize error:", errorData || error.message);
      throw new Error(errorData?.message || "Failed to initialize transaction.");
    }
  },

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference) {
    try {
      const client = getPaystackClient();
      const response = await client.get(`/transaction/verify/${reference}`);
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
      const client = getPaystackClient();
      const response = await client.post("/transferrecipient", {
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
      const client = getPaystackClient();
      const response = await client.post("/transfer", {
        source: "balance",
        amount: Math.round(amount * 100),
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
