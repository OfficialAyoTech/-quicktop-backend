const TransactionModel = require("../models/transactionModel");
const WalletService = require("./walletService");
const NotificationService = require("./notificationService");
const notificationTemplates = require("../utils/notificationTemplates");
const ReferralModel = require("../models/referralModel");
const UserModel = require("../models/userModel");
const pool = require("../config/database");
const ProviderProfitService = require("./providerProfitService");

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

        const claimed =
            await TransactionModel.updateStatusIfPending(
                reference,
                transactionStatus,
                queryResponse
            );

        if (!claimed) {
            console.log(`========== ${reference} ALREADY RESOLVED BY ANOTHER CHECK — SKIPPING ==========`);
            return transaction.status;
        }

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
                await ProviderProfitService.recordProfit(transaction);

                const referralAwarded =
                await this.maybeCompleteReferral(userId, transaction, reference);

            if (!referralAwarded) {
                await this.maybeAwardCashback(userId, transaction, reference);
            }

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
            return false;
        }

        const successfulCount =
            await TransactionModel.countSuccessfulTransactions(userId);

        if (successfulCount !== 1) {
            return false;
        }

        const referral =
            await ReferralModel.findPendingByUser(userId);

        if (!referral) {
            return false;
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
            reward,
            reference
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

        return true;

    }

        /**
     * Award cashback into the user's separate rewards balance, based on a
     * percentage of this specific purchase's margin (never the sale price —
     * margin-based cashback can mathematically never exceed what was made
     * on the sale). transaction.margin is NULL for services that don't
     * track margin (airtime, electricity) and for promotional plans, so
     * both cases are automatically skipped by the check below.
     */
        static async maybeAwardCashback(userId, transaction, reference) {

        let margin;

        if (transaction.margin === null || transaction.margin === undefined) {
            // No customer-facing markup tracked for this service (Airtime,
            // Electricity) — fall back to the real ClubKonnect commission
            // profit just recorded for this transaction, if any.
            const profitResult = await pool.query(
                `SELECT gross_profit FROM provider_profit_ledger
                 WHERE transaction_reference = $1 AND status = 'ACTIVE'`,
                [reference]
            );

            if (profitResult.rows.length === 0) {
                return;
            }

            margin = Number(profitResult.rows[0].gross_profit);
        } else {
            margin = Number(transaction.margin);
        }

        if (margin <= 0) {
            return;
        }

        const rateResult = await pool.query(
            `SELECT rate_percent, min_purchase_amount, is_enabled
             FROM cashback_rates
             WHERE service_name = $1`,
            [transaction.service]
        );

        const rateRow = rateResult.rows[0];

        if (!rateRow || !rateRow.is_enabled) {
            return;
        }

        if (Number(transaction.amount) < Number(rateRow.min_purchase_amount)) {
            return;
        }

        const cashbackAmount = Number(
            (margin * Number(rateRow.rate_percent) / 100).toFixed(2)
        );

        if (cashbackAmount <= 0) {
            return;
        }

        await pool.query(
            `INSERT INTO rewards_balances (user_id, balance, updated_at)
             VALUES ($1, $2, now())
             ON CONFLICT (user_id)
             DO UPDATE SET balance = rewards_balances.balance + $2, updated_at = now()`,
            [userId, cashbackAmount]
        );

        await pool.query(
            `INSERT INTO cashback_transactions
             (user_id, source_reference, service, purchase_amount, margin, rate_percent, cashback_amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                userId,
                reference,
                transaction.service,
                transaction.amount,
                margin,
                rateRow.rate_percent,
                cashbackAmount
            ]
        );

        await NotificationService.notify({
            user_id: userId,
            title: "🎉 Cashback Earned",
            message: `You earned ₦${cashbackAmount} cashback on your last purchase.`,
            type: "SUCCESS",
            category: "promotion",
            metadata: {
                reference,
                cashbackAmount,
                service: transaction.service
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