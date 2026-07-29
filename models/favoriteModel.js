const pool = require("../config/database");

class FavoriteModel {

    /**
     * Create Favorite
     */
    static async create(favorite, client = pool) {

        const {
            user_id,
            nickname,
            service,
            account_number,
            provider,
            metadata = {}
        } = favorite;

        const result = await client.query(
            `
            INSERT INTO favorites
            (
                user_id,
                nickname,
                service,
                account_number,
                provider,
                metadata
            )
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING *;
            `,
            [
                user_id,
                nickname,
                service,
                account_number,
                provider,
                metadata
            ]
        );

        return result.rows[0];

    }

    /**
     * Get User Favorites
     */
    static async findByUser(userId, service = null, client = pool) {

        let query = `
            SELECT *
            FROM favorites
            WHERE user_id = $1
        `;

        const params = [userId];

        if (service) {
            query += ` AND service = $2`;
            params.push(service);
        }

        query += `
            ORDER BY nickname ASC;
        `;

        const result = await client.query(query, params);

        return result.rows;

    }

    /**
     * Find Favorite By ID
     */
    static async findById(id, userId, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM favorites
            WHERE id = $1
            AND user_id = $2;
            `,
            [id, userId]
        );

        return result.rows[0];

    }

    /**
     * Delete Favorite
     */
    static async delete(id, userId, client = pool) {

        const result = await client.query(
            `
            DELETE FROM favorites
            WHERE id = $1
            AND user_id = $2
            RETURNING *;
            `,
            [id, userId]
        );

        return result.rows[0];

    }

}

module.exports = FavoriteModel;