const pool = require("../config/database");

const {
    TRANSACTION_STATUS,
    SERVICES
} = require("../utils/constants");

class UserModel {

    /**
     * Find user by PostgreSQL ID
     */
    static async findById(id, client = pool) {

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
     * Find user by Firebase UID
     */
    static async findByFirebaseUid(firebaseUid, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM users
            WHERE firebase_uid = $1
            `,
            [firebaseUid]
        );

        return result.rows[0];

    }

    /**
     * Create a new user
     */
    static async create(payload, client = pool) {

        const result = await client.query(
            `
            INSERT INTO users
            (
                firebase_uid,
                email,
                full_name
            )
            VALUES ($1, $2, $3)
            RETURNING *;
            `,
            [
                payload.firebase_uid,
                payload.email,
                payload.full_name
            ]
        );

        return result.rows[0];

    }

    /**
     * Find user by email
     */
    static async findByEmail(email, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        return result.rows[0];

    }

    /**
 * Find user by phone number
 */
static async findByPhone(phone, client = pool) {

    const result = await client.query(
        `
        SELECT *
        FROM users
        WHERE phone = $1
        `,
        [phone]
    );

    return result.rows[0];

}

    /**
     * Update user profile
     */
    static async updateProfile(userId, payload, client = pool) {

        const {
            full_name,
            phone
        } = payload;

        const result = await client.query(
            `
            UPDATE users
            SET
                full_name = $1,
                phone = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
            `,
            [
                full_name,
                phone,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Update avatar
     */
    static async updateAvatar(userId, avatarUrl, client = pool) {

        const result = await client.query(
            `
            UPDATE users
            SET
                avatar_url = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                avatarUrl,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Update phone number
     */
    static async updatePhone(userId, phone, client = pool) {

        const result = await client.query(
            `
            UPDATE users
            SET
                phone = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                phone,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
 * Update user's verification status
 */
static async updateVerificationStatus(userId, isVerified, client = pool) {

    const result = await client.query(
        `
        UPDATE users
        SET
            is_verified = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
        `,
        [
            isVerified,
            userId
        ]
    );

    return result.rows[0];

}

    /**
     * Update last login
     */
    static async updateLastLogin(userId, client = pool) {

        await client.query(
            `
            UPDATE users
            SET
                last_login = CURRENT_TIMESTAMP
            WHERE id = $1;
            `,
            [userId]
        );

    }

        /**
     * Soft delete account
     */
    static async softDelete(userId, client = pool) {

        const result = await client.query(
            `
            UPDATE users
            SET
                account_status = 'DELETED',
                deleted_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
            `,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Update referral code
     */
    static async updateReferralCode(userId, code, client = pool) {

        const result = await client.query(
            `
            UPDATE users
            SET referral_code = $1
            WHERE id = $2
            RETURNING *;
            `,
            [
                code,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Find user by referral code
     */
    static async findByReferralCode(code, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM users
            WHERE referral_code = $1
            `,
            [code]
        );

        return result.rows[0];

    }

    /**
 * Increase referral earnings
 */
static async addReferralEarnings(userId, amount, client = pool) {

    const result = await client.query(
        `
        UPDATE users
        SET
            referral_earnings =
                referral_earnings + $1
        WHERE id = $2
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
 * Count successful wallet funding transactions
 */
static async countWalletFunding(userId, client = pool) {

    const result = await client.query(
        `
        SELECT COUNT(*) total
        FROM transactions
        WHERE
            user_id = $1
        AND
            service = $2
        AND
            status = $3
        `,
        [
            userId,
            SERVICES.WALLET_FUNDING,
            TRANSACTION_STATUS.SUCCESS
        ]
    );

    return Number(result.rows[0].total);

}

}

module.exports = UserModel;