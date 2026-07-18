const crypto = require("crypto");
const PaymentService = require("./paymentService");

class WebhookService {

    /**
     * Handle Paystack Webhook
     */
    static async handlePaystackWebhook(req) {

        const signature = req.headers["x-paystack-signature"];

        if (!signature) {
            throw new Error("Missing Paystack signature.");
        }

        const hash = crypto
            .createHmac(
                "sha512",
                process.env.PAYSTACK_SECRET_KEY
            )
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (hash !== signature) {
            throw new Error("Invalid Paystack signature.");
        }

        console.log("✅ Paystack webhook signature verified.");

        const event = req.body;

        // Only process successful payments
        if (event.event !== "charge.success") {
            console.log(`Ignoring event: ${event.event}`);
            return true;
        }

        const payment = event.data;

        if (!payment) {
            throw new Error("Invalid webhook payload.");
        }

        const metadata = payment.metadata || {};

        if (!metadata.userId) {
            throw new Error("Missing userId in payment metadata.");
        }

        try {

            await PaymentService.processSuccessfulPayment(
                metadata.userId,
                payment
            );

            console.log(
                `✅ Wallet funded successfully for reference ${payment.reference}`
            );

        } catch (error) {

            // Duplicate webhook - already processed
            if (
                error.message === "This payment has already been processed."
            ) {

                console.log(
                    `ℹ️ Duplicate webhook ignored for ${payment.reference}`
                );

                return true;
            }

            throw error;

        }

        return true;

    }

}

module.exports = WebhookService;