const pool = require("../config/database");

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
}

module.exports = UserModel;