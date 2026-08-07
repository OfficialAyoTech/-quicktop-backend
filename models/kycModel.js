const pool = require("../config/database");

class KycModel {

    /**
     * Get KYC by User ID
     */
    static async findByUserId(userId, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM kyc
            WHERE user_id = $1
            `,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Create KYC Record
     */
    static async create(payload, client = pool) {

        const {
            user_id,
            bvn,
            nin,
            address,
            id_type,
            id_number,
            id_image_url,
            selfie_url
        } = payload;

        const result = await client.query(
            `
            INSERT INTO kyc
            (
                user_id,
                bvn,
                nin,
                address,
                id_type,
                id_number,
                id_image_url,
                selfie_url
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
            `,
            [
                user_id,
                bvn,
                nin,
                address,
                id_type,
                id_number,
                id_image_url,
                selfie_url
            ]
        );

        return result.rows[0];

    }

    /**
     * Update KYC
     */
    static async update(userId, payload, client = pool) {

        const {
            bvn,
            nin,
            address,
            id_type,
            id_number,
            id_image_url,
            selfie_url
        } = payload;

        const result = await client.query(
            `
            UPDATE kyc
            SET
                bvn = $1,
                nin = $2,
                address = $3,
                id_type = $4,
                id_number = $5,
                id_image_url = $6,
                selfie_url = $7,
                verification_status = 'PENDING',
                rejection_reason = NULL,
                verified_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $8
            RETURNING *;
            `,
            [
                bvn,
                nin,
                address,
                id_type,
                id_number,
                id_image_url,
                selfie_url,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Update Verification Status
     */
    static async updateStatus(
        userId,
        status,
        rejectionReason = null,
        client = pool
    ) {

        const result = await client.query(
            `
            UPDATE kyc
            SET
                verification_status = $1,
                rejection_reason = $2,
                verified_at =
                    CASE
                        WHEN $1='VERIFIED'
                        THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3
            RETURNING *;
            `,
            [
                status,
                rejectionReason,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
 * Get all KYC records
 */
static async findAll(client = pool) {

    const result = await client.query(`
        SELECT
            k.*,
            u.full_name,
            u.email,
            u.phone
        FROM kyc k
        JOIN users u
            ON u.id = k.user_id
        ORDER BY k.created_at DESC
    `);

    return result.rows;

}

/**
 * Find KYC by ID
 */
static async findById(id, client = pool) {

    const result = await client.query(`
        SELECT
            k.*,
            u.full_name,
            u.email,
            u.phone
        FROM kyc k
        JOIN users u
            ON u.id = k.user_id
        WHERE k.id = $1
    `, [id]);

    return result.rows[0];

}

/**
 * Approve KYC
 */
static async approve(id, client = pool) {

    const result = await client.query(`
        UPDATE kyc
        SET
            verification_status='VERIFIED',
            verified_at=CURRENT_TIMESTAMP,
            rejection_reason=NULL,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=$1
        RETURNING *;
    `, [id]);

    return result.rows[0];

}

/**
 * Reject KYC
 */
static async reject(id, reason, client = pool) {

    const result = await client.query(`
        UPDATE kyc
        SET
            verification_status='REJECTED',
            rejection_reason=$2,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=$1
        RETURNING *;
    `, [id, reason]);

    return result.rows[0];

}

}

module.exports = KycModel;