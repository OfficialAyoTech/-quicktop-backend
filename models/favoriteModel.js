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
     * Update Favorite
     */
    static async update(id, userId, updates, client = pool) {

        const {
            nickname,
            account_number,
            metadata
        } = updates;

        const result = await client.query(
            `
            UPDATE favorites
            SET
                nickname = COALESCE($1, nickname),
                account_number = COALESCE($2, account_number),
                metadata = COALESCE($3, metadata),
                updated_at = NOW()
            WHERE id = $4
            AND user_id = $5
            RETURNING *;
            `,
            [nickname, account_number, metadata, id, userId]
        );

        return result.rows[0];

    }

    /**
     * Find Existing Duplicate
     */
    static async findDuplicate(userId, service, accountNumber, client = pool) {

        const result = await client.query(
            `
            SELECT *
            FROM favorites
            WHERE user_id = $1
            AND service = $2
            AND account_number = $3;
            `,
            [userId, service, accountNumber]
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