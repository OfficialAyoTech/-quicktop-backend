const pool = require("../config/database");

class WalletModel {

    /**
     * Create wallet for a new user
     */
    static async create(userId, client = pool) {

        const result = await client.query(
            `
            INSERT INTO wallets
            (
                user_id
            )
            VALUES ($1)
            RETURNING *;
            `,
            [userId]
        );

        return result.rows[0];
    }

    /**
     * Find wallet by user ID
     */
    static async findByUserId(userId, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM wallets
            WHERE user_id = $1
            `,
            [userId]
        );

        return result.rows[0];
    }

    /**
     * Find wallet by wallet ID
     */
    static async findById(walletId, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM wallets
            WHERE id = $1
            `,
            [walletId]
        );

        return result.rows[0];
    }

    /**
 * Lock wallet row (Prevents double spending)
 */
static async lockWallet(walletId, client) {

    if (!client) {
        throw new Error(
            "lockWallet() requires a transaction client."
        );
    }

    const result = await client.query(
        `
        SELECT *
        FROM wallets
        WHERE id = $1
        FOR UPDATE
        `,
        [walletId]
    );

    return result.rows[0];

}

    /**
     * Update wallet balance
     */
    static async updateBalance(walletId, balance, client = pool) {

        const result = await client.query(
            `
            UPDATE wallets
            SET
                balance = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                balance,
                walletId
            ]
        );

        return result.rows[0];
    }

    /**
     * Update wallet status
     */
    static async updateStatus(walletId, status, client = pool) {

        const result = await client.query(
            `
            UPDATE wallets
            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                status,
                walletId
            ]
        );

        return result.rows[0];
    }

}

module.exports = WalletModel;