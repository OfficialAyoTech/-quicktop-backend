const { getDataPlans } = require("./clubkonnectService");
const pool = require("../config/database");

const DEFAULT_MARKUP = 20; // ₦20 flat markup — adjust to whatever you want as a starting default

class DataPlanSyncService {

    static async syncFromClubkonnect() {

        const response = await getDataPlans();
        const networks = response.MOBILE_NETWORK;

        let inserted = 0;
        let updated = 0;

        for (const networkName in networks) {

            const products = networks[networkName][0].PRODUCT;

            for (const product of products) {

                const network = networkName.toUpperCase();
                const planId = product.PRODUCT_ID;
                const planCode = product.PRODUCT_CODE;
                const planName = product.PRODUCT_NAME;
                const costPrice = Number(product.PRODUCT_AMOUNT);

                const existing = await pool.query(
                    `SELECT id, sell_price FROM data_plans WHERE network = $1 AND plan_id = $2`,
                    [network, planId]
                );

                if (existing.rows.length === 0) {

                    // New plan — insert with default markup applied
                    const sellPrice = costPrice + DEFAULT_MARKUP;

                    await pool.query(
                        `INSERT INTO data_plans
                            (network, plan_id, plan_code, plan_name, cost_price, sell_price)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [network, planId, planCode, planName, costPrice, sellPrice]
                    );

                    inserted++;

                } else {

                    // Existing plan — update cost_price only, NEVER touch sell_price
                    // (sell_price is admin-controlled and must not be overwritten by a sync)
                    await pool.query(
                        `UPDATE data_plans
                         SET cost_price = $1, plan_name = $2, updated_at = now()
                         WHERE network = $3 AND plan_id = $4`,
                        [costPrice, planName, network, planId]
                    );

                    updated++;

                }

            }

        }

        return { inserted, updated };

    }

}

module.exports = DataPlanSyncService;