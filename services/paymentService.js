const PaystackService = require("./paystackService");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const NotificationService = require("./notificationService");

const TransactionModel = require("../models/transactionModel");
const ReferralModel = require("../models/referralModel");
const UserModel = require("../models/userModel");

const DatabaseTransaction = require("../helpers/databaseTransaction");
const {
    PAYMENT_SOURCES,
    SERVICES,
    TRANSACTION_STATUS
} = require("../utils/constants");


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
        console.log("🔥 processSuccessfulPayment() started");

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
                source: PAYMENT_SOURCES.PAYSTACK,
service: SERVICES.WALLET_FUNDING,
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
            balance_after: updatedWallet.balance,
            api_response: payment
        },
        client
    );

    // Reward referrer after first successful funding
const fundingCount =
    await UserModel.countWalletFunding(
        userId,
        client
    );

    console.log("========== REFERRAL DEBUG ==========");
console.log("Funding Count:", fundingCount);

if (fundingCount === 1) {

    const referral =
        await ReferralModel.findPendingByUser(
            userId,
            client
        );

        console.log("Pending Referral:");
console.log(referral);

    if (referral) {

        console.log("✅ Referral reward is about to be processed...");
        const reward = 500;

        // Credit referrer's wallet
        await WalletService.creditWithClient(
            referral.referrer_id,
            {
                amount: reward,
                source: PAYMENT_SOURCES.REFERRAL,
service: SERVICES.REFERRAL_BONUS,
                reference: `REF-${reference}`,
                description: "Referral bonus"
            },
            client
        );

        // Update referral earnings
        await UserModel.addReferralEarnings(
            referral.referrer_id,
            reward,
            client
        );

        // Mark referral completed
        await ReferralModel.completeReferral(
            referral.id,
            reward,
            client
        );

        // Notify referrer
        await NotificationService.notify({
    user_id: referral.referrer_id,
    title: "Referral Bonus 🎉",
    message: `Congratulations! You earned ₦${reward} for referring a new user.`,
    type: "REFERRAL",
    category: "promotion",
    metadata: {
        reward,
        reference
    }
});

    }

}

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
        console.log("🔥 verifyPayment() started");

        console.log("🔥 PaymentService.verifyPayment()");
console.log(reference);

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