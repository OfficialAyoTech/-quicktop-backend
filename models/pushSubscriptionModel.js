const pool = require("../config/database");

class PushSubscriptionModel {

    /**
     * Save or update a subscription (keyed by endpoint, unique per device)
     */
    static async upsert(userId, subscription, client = pool) {

        const { endpoint, keys } = subscription;

        const result = await client.query(
            `
            INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (endpoint) DO UPDATE SET
                user_id = $1,
                p256dh = $3,
                auth = $4
            RETURNING *;
            `,
            [userId, endpoint, keys.p256dh, keys.auth]
        );

        return result.rows[0];

    }

    static async findByUser(userId, client = pool) {

        const result = await client.query(
            `SELECT * FROM push_subscriptions WHERE user_id = $1;`,
            [userId]
        );

        return result.rows;

    }

    static async deleteByEndpoint(endpoint, client = pool) {

        await client.query(
            `DELETE FROM push_subscriptions WHERE endpoint = $1;`,
            [endpoint]
        );

    }

}

module.exports = PushSubscriptionModel;