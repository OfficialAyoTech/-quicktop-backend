const pool = require("../config/database");

class RewardsService {

    /**
     * Get (or create) a user's rewards balance row.
     */
    static async getBalance(userId, client = pool) {

        const existing = await client.query(
            `SELECT * FROM rewards_balances WHERE user_id = $1`,
            [userId]
        );

        if (existing.rows[0]) {
            return existing.rows[0];
        }

        const created = await client.query(
            `INSERT INTO rewards_balances (user_id, balance, updated_at)
             VALUES ($1, 0, now())
             ON CONFLICT (user_id) DO UPDATE SET user_id = rewards_balances.user_id
             RETURNING *`,
            [userId]
        );

        return created.rows[0];

    }

    /**
     * Lock a user's rewards row for update within an existing transaction —
     * mirrors WalletModel.lockWallet so two concurrent purchases can't both
     * read the same stale balance and both succeed when only one should.
     */
    static async lockBalance(userId, client) {

        const result = await client.query(
            `SELECT * FROM rewards_balances WHERE user_id = $1 FOR UPDATE`,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Debit rewards balance using an existing transaction. Throws if the
     * balance can't cover the amount — same fail-fast behaviour as
     * WalletService.debitWithClient.
     */
    static async debitWithClient(userId, payload, client) {

        await this.getBalance(userId, client);

        const locked = await this.lockBalance(userId, client);

        const balanceBefore = Number(locked.balance);

        if (balanceBefore < Number(payload.amount)) {
            throw new Error("Insufficient rewards balance.");
        }

        const balanceAfter = balanceBefore - Number(payload.amount);

        const updated = await client.query(
            `UPDATE rewards_balances
             SET balance = $1, updated_at = now()
             WHERE user_id = $2
             RETURNING *`,
            [balanceAfter, userId]
        );

        await client.query(
            `INSERT INTO rewards_spend_log
             (user_id, reference, service, amount, balance_before, balance_after)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, payload.reference, payload.service, payload.amount, balanceBefore, balanceAfter]
        );

        return updated.rows[0];

    }

    /**
     * Credit rewards balance using an existing transaction — used both for
     * cashback payouts and for refunding a rewards-funded purchase that failed.
     */
    static async creditWithClient(userId, amount, client) {

        const result = await client.query(
            `INSERT INTO rewards_balances (user_id, balance, updated_at)
             VALUES ($1, $2, now())
             ON CONFLICT (user_id)
             DO UPDATE SET balance = rewards_balances.balance + $2, updated_at = now()
             RETURNING *`,
            [userId, amount]
        );

        return result.rows[0];

    }

}

module.exports = RewardsService;