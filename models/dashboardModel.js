const pool = require("../config/database");

class DashboardModel {

    /**
     * Dashboard Summary
     */
    static async getSummary(userId) {

        const result = await pool.query(
            `
            SELECT

            (
                SELECT balance
                FROM wallets
                WHERE user_id = $1
            ) AS wallet_balance,

            (
                SELECT COALESCE(SUM(amount),0)
                FROM transactions
                WHERE
                    user_id = $1
                AND
                    status = 'SUCCESS'
                AND
                    service <> 'Wallet Funding'
            ) AS total_spent,

            (
                SELECT COALESCE(SUM(amount),0)
                FROM transactions
                WHERE
                    user_id = $1
                AND
                    status = 'SUCCESS'
                AND
                    service = 'Wallet Funding'
            ) AS total_funded,

            (
                SELECT COUNT(*)
                FROM transactions
                WHERE user_id = $1
            ) AS total_transactions
            `,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Spending By Service
     */
    static async getServiceAnalytics(userId) {

        const result = await pool.query(
            `
            SELECT

                service,

                COUNT(*) AS total_transactions,

                COALESCE(SUM(amount),0) AS total_amount

            FROM transactions

            WHERE
                user_id = $1
            AND
                status = 'SUCCESS'

            GROUP BY service

            ORDER BY total_amount DESC
            `,
            [userId]
        );

        return result.rows;

    }

    /**
     * Monthly Spending
     */
    static async getMonthlyAnalytics(userId) {

        const result = await pool.query(
            `
            SELECT

                DATE_TRUNC('month', created_at) AS month,

                COALESCE(SUM(amount),0) AS total

            FROM transactions

            WHERE
                user_id = $1
            AND
                status = 'SUCCESS'
            AND
                service <> 'Wallet Funding'

            GROUP BY month

            ORDER BY month;
            `,
            [userId]
        );

        return result.rows;

    }

    /**
     * Recent Transactions
     */
    static async getRecentTransactions(userId) {

        const result = await pool.query(
            `
            SELECT *

            FROM transactions

            WHERE user_id = $1

            ORDER BY created_at DESC

            LIMIT 10;
            `,
            [userId]
        );

        return result.rows;

    }

}

module.exports = DashboardModel;