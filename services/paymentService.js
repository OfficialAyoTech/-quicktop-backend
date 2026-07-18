const PaystackService = require("./paystackService");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const TransactionModel = require("../models/transactionModel");
const DatabaseTransaction = require("../helpers/databaseTransaction");

class PaymentService {

    /**
     * Initialize Paystack Payment
     */
    static async initializePayment(user, payload) {

        const paymentPayload = {
            email: payload.email || user.email,
            amount: payload.amount,
            reference: payload.reference,
            callback_url: payload.callback_url,
            metadata: {
                ...(payload.metadata || {}),
                userId: user.id
            }
        };

        const response = await PaystackService.initializePayment(paymentPayload);

        return {
            message: "Payment initialized successfully.",
            data: response.data
        };

    }

    /**
     * Shared wallet funding logic
     */
    static async processSuccessfulPayment(userId, payment) {

        const reference = payment.reference;

        // Prevent duplicate funding
        const existingTransaction =
            await TransactionModel.findByReference(reference);

        if (existingTransaction) {
            throw new Error(
                "This payment has already been processed."
            );
        }

        const amount = Number(payment.amount) / 100;

        if (amount <= 0) {
            throw new Error("Invalid payment amount.");
        }

        // Credit wallet
        const wallet = await DatabaseTransaction.run(async (client) => {

    const updatedWallet =
        await WalletService.creditWithClient(
            userId,
            {
                amount,
                source: "PAYSTACK",
                service: "WALLET_FUNDING",
                reference,
                description: "Wallet funded via Paystack"
            },
            client
        );

    await TransactionService.recordWalletFunding(
        userId,
        {
            reference,
            amount,
            api_response: payment
        },
        client
    );

    return updatedWallet;

});

return {
    reference,
    amount,
    wallet: {
        balance: Number(wallet.balance),
        currency: wallet.currency
    }
};

    }

    /**
     * Verify Paystack Payment
     */
    static async verifyPayment(user, reference) {

        const response =
            await PaystackService.verifyPayment(reference);

        if (!response.status) {
            throw new Error(
                response.message || "Payment verification failed."
            );
        }

        const payment = response.data;

        if (!payment) {
            throw new Error(
                "Unable to retrieve payment details."
            );
        }

        if (payment.status !== "success") {
            throw new Error(
                `Payment is ${payment.status}.`
            );
        }

        const data = await this.processSuccessfulPayment(
            user.id,
            payment
        );

        return {
            message: "Wallet funded successfully.",
            data
        };

    }

}

module.exports = PaymentService;