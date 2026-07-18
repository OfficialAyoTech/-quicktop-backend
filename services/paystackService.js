const axios = require("axios");

const BASE_URL = process.env.PAYSTACK_BASE_URL;
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
console.log("PAYSTACK_BASE_URL:", process.env.PAYSTACK_BASE_URL);
console.log("PAYSTACK_SECRET_KEY:", process.env.PAYSTACK_SECRET_KEY?.substring(0, 12));

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

}

module.exports = PaystackService;