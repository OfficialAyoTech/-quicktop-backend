const pool = require("../config/database");

class WalletLedgerModel {

    /**
     * Create ledger record
     */
    static async create(data, client = pool) {

        const result = await client.query(
            `
            INSERT INTO wallet_ledger
            (
                wallet_id,
                type,
                source,
                service,
                amount,
                balance_before,
                balance_after,
                reference,
                description,
                status
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
            )
            RETURNING *;
            `,
            [
                data.wallet_id,
                data.type,
                data.source,
                data.service,
                data.amount,
                data.balance_before,
                data.balance_after,
                data.reference,
                data.description,
                data.status
            ]
        );

        return result.rows[0];
    }

    /**
     * Get wallet history
     */
    static async getHistory(walletId, limit = 20) {

        const result = await pool.query(
            `
            SELECT *
            FROM wallet_ledger
            WHERE wallet_id = $1
            ORDER BY created_at DESC
            LIMIT $2;
            `,
            [walletId, limit]
        );

        return result.rows;
    }

    /**
     * Find by reference
     */
    static async findByReference(reference) {

        const result = await pool.query(
            `
            SELECT *
            FROM wallet_ledger
            WHERE reference = $1
            `,
            [reference]
        );

        return result.rows[0];
    }

}

module.exports = WalletLedgerModel;