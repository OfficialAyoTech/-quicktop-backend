const pool = require("../config/database");

class DataPlansService {

    static async getPlans(network = null, provider = null) {

        let query = `
            SELECT
                plan_id AS "planId",
                provider_plan_id AS "providerPlanId",
                network,
                plan_name AS name,
                sell_price AS amount,
                cost_price AS "costPrice",
                plan_code AS code,
                provider
            FROM data_plans
            WHERE is_active = true
        `;

        const values = [];
        let parameterIndex = 1;

        if (network) {
            query += ` AND network = $${parameterIndex}`;
            values.push(network.toUpperCase());
            parameterIndex++;
        }

        if (provider) {
            query += ` AND provider = $${parameterIndex}`;
            values.push(provider.toUpperCase());
            parameterIndex++;
        }

        query += ` ORDER BY network, sell_price`;

        const result = await pool.query(query, values);

        return result.rows.map(row => ({
            ...row,
            amount: Number(row.amount),
            costPrice: Number(row.costPrice)
        }));

    }

}

module.exports = DataPlansService;