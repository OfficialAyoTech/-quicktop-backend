const pool = require("../config/database");

class AdminActionModel {

    /**
     * Log an admin action.
     * Accepts an optional `client` so callers already inside a DB
     * transaction (e.g. wallet credit/debit) can log in the same
     * transaction — a failed action never produces a phantom log row.
     */
    static async log(
        {
            admin_id,
            admin_email,
            action,
            target_type,
            target_id,
            details = null
        },
        client = pool
    ) {

        const result = await client.query(
            `
            INSERT INTO admin_actions (
                admin_id,
                admin_email,
                action,
                target_type,
                target_id,
                details
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [
                admin_id,
                admin_email,
                action,
                target_type,
                String(target_id),
                details ? JSON.stringify(details) : null
            ]
        );

        return result.rows[0];

    }

    /**
     * List admin actions, most recent first, optionally filtered
     * by target (e.g. all actions taken on a specific user or KYC record).
     */
    static async findAll(
        { page = 1, limit = 20, target_type, target_id, admin_id } = {},
        client = pool
    ) {

        const offset = (page - 1) * limit;

        let where = `WHERE 1=1`;
        const values = [];
        let index = 1;

        if (target_type) {
            where += ` AND target_type = $${index}`;
            values.push(target_type);
            index++;
        }

        if (target_id) {
            where += ` AND target_id = $${index}`;
            values.push(String(target_id));
            index++;
        }

        if (admin_id) {
            where += ` AND admin_id = $${index}`;
            values.push(admin_id);
            index++;
        }

        const totalResult = await client.query(
            `SELECT COUNT(*) AS total FROM admin_actions ${where}`,
            values
        );

        const total = Number(totalResult.rows[0].total);

        const result = await client.query(
            `
            SELECT *
            FROM admin_actions
            ${where}
            ORDER BY created_at DESC
            LIMIT $${index}
            OFFSET $${index + 1}
            `,
            [...values, limit, offset]
        );

        return {
            actions: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };

    }

}

module.exports = AdminActionModel;