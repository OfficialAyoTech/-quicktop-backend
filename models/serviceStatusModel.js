const pool = require("../config/database");

class ServiceStatusModel {

    /**
     * Get all service statuses.
     */
    static async findAll(client = pool) {

        const result = await client.query(
            `SELECT * FROM service_status ORDER BY service_name;`
        );

        return result.rows;

    }

    /**
     * Get a single service's status row.
     * Returns undefined if no row exists for this service name.
     */
    static async findByName(serviceName, client = pool) {

        const result = await client.query(
            `SELECT * FROM service_status WHERE service_name = $1;`,
            [serviceName]
        );

        return result.rows[0];

    }

    /**
     * Set a service's enabled/disabled state.
     */
    static async setEnabled(serviceName, isEnabled, adminId, client = pool) {

        const result = await client.query(
            `
            UPDATE service_status
            SET
                is_enabled = $1,
                updated_by = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE service_name = $3
            RETURNING *;
            `,
            [isEnabled, adminId, serviceName]
        );

        return result.rows[0];

    }

}

module.exports = ServiceStatusModel;