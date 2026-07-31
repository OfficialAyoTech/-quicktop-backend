const pool = require("../config/database");

class NotificationPreferenceModel {

    /**
     * Get preferences for a user, creating defaults if none exist
     */
    static async getOrCreate(userId, client = pool) {

        const result = await client.query(
            `
            INSERT INTO notification_preferences (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
            RETURNING *;
            `,
            [userId]
        );

        if (result.rows[0]) {
            return result.rows[0];
        }

        const existing = await client.query(
            `SELECT * FROM notification_preferences WHERE user_id = $1;`,
            [userId]
        );

        return existing.rows[0];

    }

    /**
     * Update preferences
     */
    static async update(userId, updates, client = pool) {

        const {
            purchase_enabled,
            wallet_enabled,
            promotions_enabled
        } = updates;

        const result = await client.query(
            `
            INSERT INTO notification_preferences
            (user_id, purchase_enabled, wallet_enabled, promotions_enabled)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE SET
                purchase_enabled = COALESCE($2, notification_preferences.purchase_enabled),
                wallet_enabled = COALESCE($3, notification_preferences.wallet_enabled),
                promotions_enabled = COALESCE($4, notification_preferences.promotions_enabled),
                updated_at = NOW()
            RETURNING *;
            `,
            [userId, purchase_enabled, wallet_enabled, promotions_enabled]
        );

        return result.rows[0];

    }

}

module.exports = NotificationPreferenceModel;