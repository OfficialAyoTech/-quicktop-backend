const axios = require("axios");

const BASE_URL = process.env.PAYSTACK_BASE_URL;
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json"
    }
});

class PaystackService {

    /**
     * Initialize Payment
     */
    static async initializePayment(payload) {

        try {

            const response = await api.post(
                "/transaction/initialize",
                {
                    email: payload.email,
                    amount: Number(payload.amount) * 100, // Kobo
                    reference: payload.reference,
                    callback_url: payload.callback_url,
                    metadata: payload.metadata || {}
                }
            );

            return response.data;

        } catch (error) {

            console.log("========== PAYSTACK INITIALIZE ERROR ==========");
            console.log(error.response?.data || error.message);

            throw new Error(
                error.response?.data?.message ||
                "Unable to initialize payment."
            );

        }

    }

        /**
     * Verify Payment
     */
    static async verifyPayment(reference) {

    try {

        const response = await api.get(
            `/transaction/verify/${reference}`
        );

        console.log("========== PAYSTACK VERIFY RESPONSE ==========");
        console.log(JSON.stringify(response.data, null, 2));

        return response.data;

    } catch (error) {

        console.log("========== PAYSTACK VERIFY ERROR ==========");
        console.log(error.response?.data || error.message);

        throw new Error(
            error.response?.data?.message ||
            "Unable to verify payment."
        );

    }

}

        /**
     * List Settlements — fetches a page of settlement payouts from Paystack.
     * Used by the daily/manual settlement sync, not the customer-facing flow.
     */
    static async listSettlements(perPage = 50, page = 1) {

        try {

            const response = await api.get(
                `/settlement?perPage=${perPage}&page=${page}`
            );

            return response.data;

        } catch (error) {

            console.log("========== PAYSTACK SETTLEMENTS ERROR ==========");
            console.log(error.response?.data || error.message);

            throw new Error(
                error.response?.data?.message ||
                "Unable to fetch settlements."
            );

        }

    }

    /**
     * List Settlement Transactions — fetches the individual transactions
     * that make up one settlement payout. Called on demand (not synced/
     * stored) since this is a drill-down view, not something needed for
     * every dashboard load.
     */
    static async listSettlementTransactions(settlementId) {

        try {

            const response = await api.get(
                `/settlement/${settlementId}/transactions`
            );

            return response.data;

        } catch (error) {

            console.log("========== PAYSTACK SETTLEMENT TRANSACTIONS ERROR ==========");
            console.log(error.response?.data || error.message);

            throw new Error(
                error.response?.data?.message ||
                "Unable to fetch settlement transactions."
            );

        }

    }

}

module.exports = PaystackService;