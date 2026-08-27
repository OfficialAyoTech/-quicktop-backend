const pool = require("../config/database");
const generateReference = require("../utils/referenceGenerator");

class RewardLedgerService {

    /**
     * Creates a new reward claim record in PENDING status and immediately
     * moves it through to CREDITED in one call — this is the "happy path"
     * used by the coupon claim flow (Step 3), where eligibility has already
     * been fully validated and RewardBudgetService.deduct() has already
     * succeeded before this is ever called. There is no separate manual
     * approval step in Phase 1 (per spec section 20 — admin approval workflow
     * is not part of the initial version), so PENDING->CREDITED happens
     * atomically here rather than as two separate admin actions.
     *
     * Never call this before the budget deduction succeeds — if the ledger
     * write fails after budget was already deducted, the mismatch would need
     * a manual reconciliation. Caller is responsible for sequencing.
     */
    static async recordClaim({ userId, promotionId, amount, transactionReference, walletLedgerReference }) {

        if (!userId) throw new Error("userId is required to record a reward claim");
        if (!amount || Number(amount) <= 0) throw new Error("A valid amount is required to record a reward claim");

        const result = await pool.query(
            `INSERT INTO reward_ledger
             (user_id, promotion_id, amount, status, claim_reference, funding_source,
              transaction_reference, wallet_ledger_reference)
             VALUES ($1, $2, $3, 'CREDITED', $4, 'REWARD_BUDGET', $5, $6)
             RETURNING *`,
            [
                userId,
                promotionId || null,
                amount,
                generateReference("RWDCLAIM"),
                transactionReference || null,
                walletLedgerReference || null
            ]
        );

                return result.rows[0];

    }

    /**
     * Same as recordClaim(), but runs inside a transaction the caller
     * already owns — used by the claim flow alongside
     * RewardBudgetService.deductWithClient() and WalletService.creditWithClient()
     * so the full claim is one atomic operation.
     */
    static async recordClaimWithClient({ userId, promotionId, amount, transactionReference, walletLedgerReference }, client) {

        if (!userId) throw new Error("userId is required to record a reward claim");
        if (!amount || Number(amount) <= 0) throw new Error("A valid amount is required to record a reward claim");

        const result = await client.query(
            `INSERT INTO reward_ledger
             (user_id, promotion_id, amount, status, claim_reference, funding_source,
              transaction_reference, wallet_ledger_reference)
             VALUES ($1, $2, $3, 'CREDITED', $4, 'REWARD_BUDGET', $5, $6)
             RETURNING *`,
            [
                userId,
                promotionId || null,
                amount,
                generateReference("RWDCLAIM"),
                transactionReference || null,
                walletLedgerReference || null
            ]
        );

        return result.rows[0];

    }

    /**
     * Anti-abuse check: has this user already claimed this promotion?
     * Backed by the unique index on (user_id, promotion_id) at the DB level
     * too — this is the fast pre-check so the claim flow can return a clean
     * "You have already claimed this reward." message instead of a raw
     * constraint-violation error.
     */
    static async hasUserClaimed(userId, promotionId) {

        const result = await pool.query(
            `SELECT id FROM reward_ledger
             WHERE user_id = $1 AND promotion_id = $2
               AND status IN ('PENDING', 'APPROVED', 'CREDITED')
             LIMIT 1`,
            [userId, promotionId]
        );

        return result.rows.length > 0;

    }

    /**
     * Total number of successful claims against a promotion so far —
     * used by the claim flow to enforce max_claims.
     */
    static async countClaimsForPromotion(promotionId) {

        const result = await pool.query(
            `SELECT COUNT(*)::int AS count FROM reward_ledger
             WHERE promotion_id = $1 AND status = 'CREDITED'`,
            [promotionId]
        );

        return result.rows[0].count;

    }

    /**
     * Marks a previously CREDITED claim as REVERSED — mirrors
     * RewardBudgetService.reverse(), called alongside it (e.g. if a
     * qualifying transaction later gets reversed/refunded, per spec
     * section 13 — reversed transactions must not qualify).
     */
    static async reverseClaim(claimReference, reason) {

        const result = await pool.query(
            `UPDATE reward_ledger
             SET status = 'REVERSED', rejection_reason = $1, updated_at = now()
             WHERE claim_reference = $2 AND status = 'CREDITED'
             RETURNING *`,
            [reason || "Reversed", claimReference]
        );

        if (result.rows.length === 0) {
            throw new Error("Claim not found or not in a reversible state.");
        }

        return result.rows[0];

    }

    /**
     * Admin-facing: recent claims for the Overview dashboard (spec section 15).
     */
    static async getRecentClaims({ limit = 50, offset = 0 } = {}) {

        const result = await pool.query(
            `SELECT rl.*, u.full_name, u.email
             FROM reward_ledger rl
             JOIN users u ON u.id = rl.user_id
             ORDER BY rl.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return result.rows;

    }

    /**
     * Admin-facing: totals for the Overview dashboard.
     */
    static async getClaimStats() {

        const result = await pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE status = 'CREDITED')::int AS total_claims,
                COALESCE(SUM(amount) FILTER (WHERE status = 'CREDITED'), 0) AS total_rewards_given
             FROM reward_ledger`
        );

        const row = result.rows[0];

        return {
            total_claims: row.total_claims,
            total_rewards_given: Number(row.total_rewards_given)
        };

    }

}

module.exports = RewardLedgerService;