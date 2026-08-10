const TransactionModel = require("../models/transactionModel");
const WalletService = require("./walletService");
const NotificationService = require("./notificationService");
const notificationTemplates = require("../utils/notificationTemplates");
const ReferralModel = require("../models/referralModel");
const UserModel = require("../models/userModel");

const {
    queryTransaction
} = require("./clubkonnectService");

const {
    TRANSACTION_STATUS,
    PAYMENT_SOURCES,
    SERVICES
} = require("../utils/constants");

const MIN_REFERRAL_QUALIFYING_AMOUNT = 500;

class TransactionStatusService {

    /**
     * Check transaction status from provider
     */
    static async check(reference, userId, amount) {

        console.log("========== CHECKING TRANSACTION ==========");
        console.log(reference);

        const queryResponse = await queryTransaction({
            requestId: reference
        });

        console.log("========== QUERY RESPONSE ==========");
        console.log(queryResponse);

        let transactionStatus = TRANSACTION_STATUS.PENDING;

        if (
            queryResponse.statuscode === "200" ||
            queryResponse.status === "ORDER_COMPLETED"
        ) {

            transactionStatus = TRANSACTION_STATUS.SUCCESS;

        } else if (
            queryResponse.status === "ORDER_RECEIVED"
        ) {

            transactionStatus = TRANSACTION_STATUS.PENDING;

        } else {

            transactionStatus = TRANSACTION_STATUS.FAILED;

        }

        console.log("========== TRANSACTION STATUS ==========");
        console.log(transactionStatus);

        const transaction =
            await TransactionModel.findByReference(reference);

        await TransactionModel.updateStatus(
            reference,
            transactionStatus,
            queryResponse
        );

        console.log("========== DATABASE UPDATED ==========");

        // SUCCESS
        if (transactionStatus === TRANSACTION_STATUS.SUCCESS) {

            const notification =
                this.getNotification(
                    transaction,
                    "SUCCESS"
                );

            await NotificationService.notify({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                type: "SUCCESS",
                category: "purchase",
                metadata: {
                    reference,
                    amount,
                    service: transaction.service
                }
            });

            // Referral reward: only released once the referred user has
            // funded their wallet AND completed a real, qualifying
            // purchase — not on funding alone. Requiring the purchase to
            // be >= the reward amount prevents someone farming referrals
            // with a token 20-naira purchase for a 500-naira payout.
            await this.maybeCompleteReferral(userId, transaction, reference);

        }

        // FAILED
        if (transactionStatus === TRANSACTION_STATUS.FAILED) {

            console.log("========== REFUNDING WALLET ==========");

            await WalletService.credit(
                userId,
                {
                    amount,
                    source: "REFUND",
                    service: transaction.service,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed transaction"
                }
            );

            console.log("========== REFUND COMPLETED ==========");

            const notification =
                this.getNotification(
                    transaction,
                    "FAILED"
                );

            await NotificationService.notify({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                type: "FAILED",
                category: "purchase",
                metadata: {
                    reference,
                    amount,
                    service: transaction.service
                }
            });

        }

        return transactionStatus;

    }

    /**
     * Complete a pending referral if this user just completed their
     * first successful purchase of at least MIN_REFERRAL_QUALIFYING_AMOUNT.
     */
    static async maybeCompleteReferral(userId, transaction, reference) {

        if (Number(transaction.amount) < MIN_REFERRAL_QUALIFYING_AMOUNT) {
            return;
        }

        const successfulCount =
            await TransactionModel.countSuccessfulTransactions(userId);

        if (successfulCount !== 1) {
            return;
        }

        const referral =
            await ReferralModel.findPendingByUser(userId);

        if (!referral) {
            return;
        }

        const reward = 500;

        await WalletService.credit(
            referral.referrer_id,
            {
                amount: reward,
                source: PAYMENT_SOURCES.REFERRAL,
                service: SERVICES.REFERRAL_BONUS,
                reference: `REF-${reference}`,
                description: "Referral bonus"
            }
        );

        await UserModel.addReferralEarnings(
            referral.referrer_id,
            reward
        );

        await ReferralModel.completeReferral(
            referral.id,
            reward
        );

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

    /**
     * Build notification from template
     */
    static getNotification(transaction, status) {

        const template =
            notificationTemplates[
                transaction.service
            ]?.[status];

        if (!template) {

            return {
                title: `Transaction ${status}`,
                message: `Your transaction has been ${status.toLowerCase()}.`
            };

        }

        return template({
            amount: transaction.amount,
            phone: transaction.phone,
            reference: transaction.reference,
            network: transaction.network
        });

    }

}

module.exports = TransactionStatusService;