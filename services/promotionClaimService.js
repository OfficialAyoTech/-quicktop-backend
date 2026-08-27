const DatabaseTransaction = require("../helpers/databaseTransaction");
const WalletService = require("./walletService");
const RewardBudgetService = require("./rewardBudgetService");
const RewardLedgerService = require("./rewardLedgerService");
const generateReference = require("../utils/referenceGenerator");
const { PAYMENT_SOURCES, SERVICES } = require("../utils/constants");

class PromotionClaimService {

    /**
     * Full claim flow per spec section 5. Every check happens server-side
     * inside one database transaction — a user can never bypass the
     * frontend to force a claim through, and budget deduction, wallet
     * credit, and the ledger record either all succeed together or none do.
     */
    static async claim(userId, promotionId) {

        return DatabaseTransaction.run(async (client) => {

            // Lock the promotion row for this transaction so two concurrent
            // claims near max_claims can't both read "under limit" and both succeed.
            const promoResult = await client.query(
                `SELECT * FROM promotions WHERE id = $1 FOR UPDATE`,
                [promotionId]
            );

            const promo = promoResult.rows[0];

            if (!promo || !promo.is_active) {
                throw new Error("This promotion is currently unavailable.");
            }

            const now = new Date();
            if (now < new Date(promo.start_date) || now > new Date(promo.expiry_date)) {
                throw new Error("This promotion has expired.");
            }

            if (promo.max_claims !== null) {
                const countResult = await client.query(
                    `SELECT COUNT(*)::int AS count FROM reward_ledger
                     WHERE promotion_id = $1 AND status = 'CREDITED'`,
                    [promotionId]
                );
                if (countResult.rows[0].count >= promo.max_claims) {
                    throw new Error("This promotion has reached its claim limit.");
                }
            }

            const userClaimCountResult = await client.query(
                `SELECT COUNT(*)::int AS count FROM reward_ledger
                 WHERE user_id = $1 AND promotion_id = $2 AND status = 'CREDITED'`,
                [userId, promotionId]
            );
            if (userClaimCountResult.rows[0].count >= promo.max_claims_per_user) {
                throw new Error("You have already claimed this reward.");
            }

            const eligible = await this.checkEligibility(userId, promo, client);
            if (!eligible) {
                throw new Error("You are not eligible for this reward.");
            }

            const walletCreditReference = generateReference("RWDCR");

            const budgetResult = await RewardBudgetService.deductWithClient(
                promo.reward_amount,
                walletCreditReference,
                `Reward claim: ${promo.name}`,
                client
            );

            if (!budgetResult) {
                throw new Error("Reward currently unavailable.");
            }

            await WalletService.creditWithClient(
                userId,
                {
                    amount: promo.reward_amount,
                    source: PAYMENT_SOURCES.PROMOTION,
                    service: SERVICES.WALLET_FUNDING,
                    reference: walletCreditReference,
                    description: `Reward: ${promo.name}`
                },
                client
            );

            const claim = await RewardLedgerService.recordClaimWithClient(
                {
                    userId,
                    promotionId: promo.id,
                    amount: promo.reward_amount,
                    transactionReference: null,
                    walletLedgerReference: walletCreditReference
                },
                client
            );

            return {
                message: `You claimed ₦${Number(promo.reward_amount).toLocaleString()} from ${promo.name}.`,
                claim
            };

        });

    }

    /**
     * Checks whether the user has a qualifying successful transaction for
     * this promotion. Only status = 'successful' ever qualifies — failed
     * and reversed transactions are excluded by the WHERE clause itself,
     * per spec section 13.
     */
    static async checkEligibility(userId, promo, client) {

        if (promo.eligibility === "NONE") {
            return true;
        }

        if (promo.eligibility === "ANY_TRANSACTION") {

            const result = await client.query(
                `SELECT id FROM transactions
                 WHERE user_id = $1
                   AND status = 'successful'
                   AND amount >= $2
                   AND ($3::text IS NULL OR service = $3)
                 LIMIT 1`,
                [userId, promo.min_transaction_amount, promo.required_service]
            );

            return result.rows.length > 0;

        }

        if (promo.eligibility === "FIRST_TRANSACTION") {

            // The user's very first-ever successful transaction must itself
            // meet the criteria — this is the "welcome bonus" case, not just
            // any early qualifying purchase.
            const result = await client.query(
                `SELECT service, amount FROM transactions
                 WHERE user_id = $1 AND status = 'successful'
                 ORDER BY created_at ASC
                 LIMIT 1`,
                [userId]
            );

            const firstTx = result.rows[0];
            if (!firstTx) return false;
            if (Number(firstTx.amount) < Number(promo.min_transaction_amount)) return false;
            if (promo.required_service && firstTx.service !== promo.required_service) return false;

            return true;

        }

        return false;

    }

}

module.exports = PromotionClaimService;