const pool = require("../config/database");

class TransactionModel {

    /**
 * Create a new transaction
 */
static async create(transaction, client = pool) {

    const {
    user_id,
    recipient_user_id = null,
    reference,
    provider,
    service,
    phone = null,
    amount,
    status,
    transaction_type = "PURCHASE",
    narration = null,
    network = null,
    balance_after = null,
    api_response = {}
} = transaction;

    const query = `
        INSERT INTO transactions
        (
            user_id,
            recipient_user_id,
            reference,
            provider,
            service,
            phone,
            amount,
            status,
            transaction_type,
            narration,
            network,
            balance_after,
            api_response
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING *;
    `;

    const values = [
        user_id,
        recipient_user_id,
        reference,
        provider,
        service,
        phone,
        amount,
        status,
        transaction_type,
        narration,
        network,
        balance_after,
        api_response
    ];

    const result = await client.query(query, values);

    return result.rows[0];

}

    /**
     * Find transaction by reference
     */
    static async findByReference(reference, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM transactions
            WHERE reference = $1
            `,
            [reference]
        );

        return result.rows[0];
    }

    /**
     * Get transactions for a user (with filters & pagination)
     */
    static async getTransactions(
    userId,
    options = {},
    client = pool
) {

        const {
            service,
            status,
            limit = 20,
            offset = 0
        } = options;

        let query = `
            SELECT *
            FROM transactions
            WHERE user_id = $1
        `;

        const values = [userId];
        let index = 2;

        if (service) {
            query += ` AND service = $${index}`;
            values.push(service);
            index++;
        }

        if (status) {
            query += ` AND status = $${index}`;
            values.push(status);
            index++;
        }

        query += `
            ORDER BY created_at DESC
            LIMIT $${index}
            OFFSET $${index + 1}
        `;

        values.push(limit, offset);

        const result = await client.query(query, values);

        return result.rows;
    }

    /**
     * Get all transactions for a user
     */
    static async findByUser(userId, client = pool) {

        const result = await client.query(
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
    static async updateStatus(
    reference,
    status,
    apiResponse,
    client = pool
) {

        const result = await client.query(
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