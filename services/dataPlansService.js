const pool = require("../config/database");

class DataPlansService {

    static async getPlans(network = null) {

        let query = `
            SELECT plan_id AS "planId",
                   network,
                   plan_name AS name,
                   sell_price AS amount,
                   plan_code AS code
            FROM data_plans
            WHERE is_active = true
        `;

        const values = [];

        if (network) {
            query += ` AND network = $1`;
            values.push(network.toUpperCase());
        }

        query += ` ORDER BY network, sell_price`;

        const result = await pool.query(query, values);

        return result.rows.map(row => ({
            ...row,
            amount: Number(row.amount)
        }));

    }

}

module.exports = DataPlansService;