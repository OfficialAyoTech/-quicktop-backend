const pool = require("../config/database");

class PinModel {

    /**
     * Get user's PIN information
     */
    static async findByUserId(userId, client = pool) {

        const result = await client.query(
            `
            SELECT
                id,
                transaction_pin,
                transaction_pin_created,
                pin_attempts,
                pin_locked_until
            FROM users
            WHERE id = $1
            `,
            [userId]
        );

        return result.rows[0];

    }

    /**
     * Save new PIN
     */
    static async createPin(
        userId,
        hashedPin,
        client = pool
    ) {

        const result = await client.query(
            `
            UPDATE users
            SET
                transaction_pin = $1,
                transaction_pin_created = TRUE,
                pin_attempts = 0,
                pin_locked_until = NULL
            WHERE id = $2
            RETURNING id, transaction_pin_created;
            `,
            [
                hashedPin,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Update PIN
     */
    static async updatePin(
        userId,
        hashedPin,
        client = pool
    ) {

        const result = await client.query(
            `
            UPDATE users
            SET
                transaction_pin = $1,
                pin_attempts = 0,
                pin_locked_until = NULL
            WHERE id = $2
            RETURNING id;
            `,
            [
                hashedPin,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Increase failed attempts
     */
    static async incrementAttempts(
        userId,
        attempts,
        client = pool
    ) {

        const result = await client.query(
            `
            UPDATE users
            SET pin_attempts = $1
            WHERE id = $2
            RETURNING pin_attempts;
            `,
            [
                attempts,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Lock PIN
     */
    static async lockPin(
        userId,
        lockedUntil,
        client = pool
    ) {

        await client.query(
            `
            UPDATE users
            SET
                pin_attempts = 0,
                pin_locked_until = $1
            WHERE id = $2
            `,
            [
                lockedUntil,
                userId
            ]
        );

    }

    /**
     * Reset failed attempts
     */
    static async resetAttempts(
        userId,
        client = pool
    ) {

        await client.query(
            `
            UPDATE users
            SET
                pin_attempts = 0,
                pin_locked_until = NULL
            WHERE id = $1
            `,
            [userId]
        );

    }

}

module.exports = PinModel;