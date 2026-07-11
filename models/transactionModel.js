const pool = require("../config/database");

class TransactionModel {

    /**
     * Create a new transaction
     */
    static async create(transaction) {

        const {
            user_id,
            reference,
            provider,
            service,
            phone,
            amount,
            status,
            api_response
        } = transaction;

        const query = `
            INSERT INTO transactions
            (
                user_id,
                reference,
                provider,
                service,
                phone,
                amount,
                status,
                api_response
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
        `;

        const values = [
            user_id,
            reference,
            provider,
            service,
            phone,
            amount,
            status,
            api_response
        ];

        const result = await pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Find transaction by reference
     */
    static async findByReference(reference) {

        const result = await pool.query(
            "SELECT * FROM transactions WHERE reference = $1",
            [reference]
        );

        return result.rows[0];
    }

    /**
     * Get all transactions for a user
     */
    static async findByUser(userId) {

        const result = await pool.query(
            `
            SELECT *
            FROM transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return result.rows;
    }

    /**
     * Update transaction status
     */
    static async updateStatus(reference, status, apiResponse) {

        const result = await pool.query(
            `
            UPDATE transactions
            SET
                status = $1,
                api_response = $2
            WHERE reference = $3
            RETURNING *;
            `,
            [
                status,
                apiResponse,
                reference
            ]
        );

        return result.rows[0];
    }

}

module.exports = TransactionModel;