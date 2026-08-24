const pool = require("../config/database");

class ReferralModel {

    /**
     * Create referral
     */
    static async create(payload, client = pool) {

        const result = await client.query(
            `
            INSERT INTO referrals
            (
                referrer_id,
                referred_user_id,
                reward,
                status
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            `,
            [
                payload.referrer_id,
                payload.referred_user_id,
                payload.reward,
                payload.status
            ]
        );

        return result.rows[0];

    }

    /**
     * Find by referred user
     */
    static async findByReferredUser(userId, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM referrals
            WHERE referred_user_id = $1
            `,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Get all referrals for a user
     */
    static async findByReferrer(userId, client = pool) {

        const result = await client.query(
            `
            SELECT
                r.*,
                u.full_name,
                u.email
            FROM referrals r
            JOIN users u
                ON r.referred_user_id = u.id
            WHERE r.referrer_id = $1
            ORDER BY r.created_at DESC
            `,
            [userId]
        );

        return result.rows;

    }

    /**
     * Count referrals
     */
    static async count(userId, client = pool) {

        const result = await client.query(
            `
            SELECT COUNT(*) total
            FROM referrals
            WHERE referrer_id = $1
            `,
            [userId]
        );

        return Number(result.rows[0].total);

    }

    /**
 * Get pending referral for a referred user
 */
static async findPendingByUser(userId, client = pool) {

    const result = await client.query(
        `
        SELECT *
        FROM referrals
        WHERE referred_user_id = $1
        AND status = 'PENDING'
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0];

}

/**
 * Mark referral as completed
 */
static async completeReferral(id, reward, transactionReference, client = pool) {

    const result = await client.query(
        `
        UPDATE referrals
        SET
            reward = $1,
            status = 'COMPLETED',
            transaction_reference = $2
        WHERE id = $3
        RETURNING *;
        `,
        [
            reward,
            transactionReference,
            id
        ]
    );

    return result.rows[0];

    }

}

module.exports = ReferralModel;