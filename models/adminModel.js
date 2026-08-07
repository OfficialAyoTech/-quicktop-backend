const pool = require("../config/database");

class AdminModel {

    /**
     * Dashboard statistics
     */
    static async getDashboard(client = pool) {

        const result = await client.query(`
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,

                (SELECT COUNT(*) FROM users
                 WHERE account_status = 'ACTIVE') AS active_users,

                (SELECT COUNT(*) FROM kyc
                 WHERE verification_status = 'PENDING') AS pending_kyc,

                (SELECT COUNT(*) FROM kyc
                 WHERE verification_status = 'VERIFIED') AS verified_kyc,

                (SELECT COALESCE(SUM(balance),0)
                 FROM wallets
                 WHERE status='ACTIVE') AS total_wallet_balance,

                (SELECT COUNT(*)
                 FROM transactions) AS total_transactions,

                (SELECT COUNT(*)
                 FROM transactions
                 WHERE DATE(created_at)=CURRENT_DATE) AS today_transactions;
        `);

        return result.rows[0];

    }

    /**
 * Get users with pagination, search and filters
 */
static async getUsers(options = {}, client = pool) {

    const {
        page = 1,
        limit = 10,
        search = "",
        role,
        status,
        verified
    } = options;

    const offset = (page - 1) * limit;

    let where = `WHERE 1=1`;

    const values = [];
    let index = 1;

    if (search) {

        where += `
            AND (
                full_name ILIKE $${index}
                OR email ILIKE $${index}
                OR phone ILIKE $${index}
            )
        `;

        values.push(`%${search}%`);
        index++;

    }

    if (role) {

        where += ` AND role = $${index}`;
        values.push(role);
        index++;

    }

    if (status) {

        where += ` AND account_status = $${index}`;
        values.push(status);
        index++;

    }

    if (verified !== undefined) {

        where += ` AND is_verified = $${index}`;
        values.push(verified);
        index++;

    }

    // Total count
    const totalQuery = `
        SELECT COUNT(*) AS total
        FROM users
        ${where}
    `;

    const totalResult = await client.query(
        totalQuery,
        values
    );

    const total = Number(totalResult.rows[0].total);

    // Users
    const usersQuery = `
        SELECT
            id,
            full_name,
            email,
            phone,
            role,
            account_status,
            is_verified,
            created_at
        FROM users
        ${where}
        ORDER BY created_at DESC
        LIMIT $${index}
        OFFSET $${index + 1}
    `;

    const userValues = [
        ...values,
        limit,
        offset
    ];

    const users = await client.query(
        usersQuery,
        userValues
    );

    return {
        users: users.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };

}

/**
 * Get user by ID
 */
static async getUserById(id, client = pool) {

    const result = await client.query(
        `
        SELECT *
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Update account status
 */
static async updateUserStatus(id, status, client = pool) {

    const result = await client.query(
        `
        UPDATE users
        SET
            account_status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
        `,
        [
            status,
            id
        ]
    );

    return result.rows[0];

}

/**
 * Get all wallets
 */
static async getWallets(client = pool) {

    const result = await client.query(`
        SELECT
            w.id AS wallet_id,
            w.user_id,
            u.full_name,
            u.email,
            u.phone,
            w.balance,
            w.currency,
            w.status,
            w.created_at,
            w.updated_at
        FROM wallets w
        JOIN users u
            ON u.id = w.user_id
        ORDER BY w.created_at DESC
    `);

    return result.rows;

}

/**
 * Get wallet by user ID
 */
static async getWalletByUserId(userId, client = pool) {

    const result = await client.query(
        `
        SELECT
            w.id AS wallet_id,
            w.user_id,
            u.full_name,
            u.email,
            u.phone,
            w.balance,
            w.currency,
            w.status,
            w.created_at,
            w.updated_at
        FROM wallets w
        JOIN users u
            ON u.id = w.user_id
        WHERE w.user_id = $1
        `,
        [userId]
    );

    return result.rows[0];

}

/**
 * Get wallet by wallet ID
 */
static async getWalletById(walletId, client = pool) {

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
 * Credit wallet
 */
static async creditWallet(userId, amount, client = pool) {

    const result = await client.query(
        `
        UPDATE wallets
        SET
            balance = balance + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
        RETURNING *;
        `,
        [
            amount,
            userId
        ]
    );

    return result.rows[0];

}

/**
 * Get all transactions
 */
static async getTransactions(options = {}, client = pool) {

    const {

        page = 1,

        limit = 20,

        status,

        service,

        provider,

        transaction_type,

        search

    } = options;

    const offset = (page - 1) * limit;

    let where = `WHERE 1=1`;

    const values = [];

    let index = 1;

    if (status) {

        where += ` AND t.status = $${index}`;

        values.push(status);

        index++;

    }

    if (service) {

        where += ` AND t.service = $${index}`;

        values.push(service);

        index++;

    }

    if (provider) {

        where += ` AND t.provider = $${index}`;

        values.push(provider);

        index++;

    }

    if (transaction_type) {

        where += ` AND t.transaction_type = $${index}`;

        values.push(transaction_type);

        index++;

    }

    if (search) {

        where += `
            AND (

                t.reference ILIKE $${index}

                OR u.full_name ILIKE $${index}

                OR u.email ILIKE $${index}

            )
        `;

        values.push(`%${search}%`);

        index++;

    }

    const totalResult = await client.query(

        `

        SELECT COUNT(*) total

        FROM transactions t

        JOIN users u

        ON u.id = t.user_id

        ${where}

        `,

        values

    );

    const total = Number(totalResult.rows[0].total);

    const result = await client.query(

        `

        SELECT

            t.*,

            u.full_name,

            u.email

        FROM transactions t

        JOIN users u

        ON u.id = t.user_id

        ${where}

        ORDER BY t.created_at DESC

        LIMIT $${index}

        OFFSET $${index + 1}

        `,

        [

            ...values,

            limit,

            offset

        ]

    );

    return {

        transactions: result.rows,

        pagination: {

            page,

            limit,

            total,

            totalPages: Math.ceil(total / limit)

        }

    };

}

/**
 * Get transaction by reference
 */
static async getTransaction(reference, client = pool) {

    const result = await client.query(

        `

        SELECT

            t.*,

            u.full_name,

            u.email,

            u.phone

        FROM transactions t

        JOIN users u

        ON u.id = t.user_id

        WHERE t.reference = $1

        `,

        [reference]

    );

    return result.rows[0];

}

}

module.exports = AdminModel;