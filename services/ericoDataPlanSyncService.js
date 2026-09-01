const EricoDataService = require("./EricoDataService");
const pool = require("../config/database");

const DEFAULT_MARKUP = 20;

class EricoDataPlanSyncService {

    static async syncNetwork(network) {

        const normalizedNetwork = network.toLowerCase();

        console.log(
            `Fetching ${normalizedNetwork.toUpperCase()} plans from ERICODATA...`
        );

        const response = await EricoDataService.getPlans(
    normalizedNetwork
);

/*
 * ERICODATA getPlans() returns:
 *
 * {
 *   success: true,
 *   network: "MTN",
 *   plans: [...]
 * }
 *
 * Therefore, the actual plans are inside response.plans.
 */
const plans = response?.plans;

if (!Array.isArray(plans)) {
    console.log("ERICODATA response received:");
    console.dir(response, { depth: null });

    throw new Error(
        "Invalid ERICODATA plans response."
    );
}

        console.log(
            `ERICODATA returned ${plans.length} ${normalizedNetwork.toUpperCase()} plans.`
        );

        let inserted = 0;
        let updated = 0;

        for (const plan of plans) {

            const providerPlanId = String(plan.id);

            const networkName = String(
                plan.network || network
            ).toUpperCase();

            const planType = plan.plan_type || "DATA";

            const planName = `${plan.plan} - ${plan.month_validate} (${planType})`;

            /*
             * ERICODATA:
             *
             * original_amount = provider cost
             * plan_amount     = provider selling/reference amount
             */
            const costPrice = Number(plan.original_amount);
            const providerAmount = Number(plan.plan_amount);

            if (
                !providerPlanId ||
                !networkName ||
                !plan.plan ||
                !Number.isFinite(costPrice)
            ) {

                console.warn(
                    "Skipping invalid ERICODATA plan:",
                    plan
                );

                continue;
            }

            /*
             * Prefix the internal identifiers so ERICODATA
             * plans cannot collide with ClubKonnect plans.
             */
            const planId = `ERICODATA-${providerPlanId}`;
            const planCode = `ERICODATA-${providerPlanId}`;

            /*
             * Use ERICODATA's plan_amount as the initial
             * QuickTop selling price.
             *
             * Example:
             *
             * original_amount = 220
             * plan_amount     = 250
             *
             * QuickTop:
             *
             * cost_price = 220
             * sell_price = 250
             */
            const sellPrice = providerAmount > 0
                ? providerAmount
                : costPrice + DEFAULT_MARKUP;

            /*
             * Check whether this exact ERICODATA plan
             * already exists.
             */
            const existing = await pool.query(
                `
                SELECT id
                FROM data_plans
                WHERE provider = $1
                  AND provider_plan_id = $2
                `,
                [
                    "ERICODATA",
                    providerPlanId
                ]
            );

            if (existing.rows.length === 0) {

                /*
                 * NEW ERICODATA PLAN
                 */
                await pool.query(
                    `
                    INSERT INTO data_plans (
                        network,
                        plan_id,
                        plan_code,
                        plan_name,
                        cost_price,
                        sell_price,
                        is_active,
                        is_promotional,
                        provider_plan_id,
                        provider
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        true,
                        false,
                        $7,
                        $8
                    )
                    `,
                    [
                        networkName,
                        planId,
                        planCode,
                        planName,
                        costPrice,
                        sellPrice,
                        providerPlanId,
                        "ERICODATA"
                    ]
                );

                inserted++;

            } else {

                /*
                 * EXISTING ERICODATA PLAN
                 *
                 * Update provider information only.
                 *
                 * DO NOT change sell_price.
                 * Admin-controlled pricing must remain intact.
                 */
                await pool.query(
                    `
                    UPDATE data_plans
                    SET
                        cost_price = $1,
                        plan_name = $2,
                        updated_at = NOW()
                    WHERE provider = $3
                      AND provider_plan_id = $4
                    `,
                    [
                        costPrice,
                        planName,
                        "ERICODATA",
                        providerPlanId
                    ]
                );

                updated++;
            }
        }

        return {
            provider: "ERICODATA",
            network: normalizedNetwork.toUpperCase(),
            total: plans.length,
            inserted,
            updated
        };
    }
}

module.exports = EricoDataPlanSyncService;