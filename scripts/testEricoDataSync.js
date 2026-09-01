require("dotenv").config();

const pool = require("../config/database");
const EricoDataPlanSyncService = require(
    "../services/ericoDataPlanSyncService"
);

async function test() {

    try {

        console.log("=================================");
        console.log("ERICODATA PLAN SYNC TEST");
        console.log("=================================\n");

        const result =
            await EricoDataPlanSyncService.syncNetwork("mtn");

        console.log("\nSync result:");
        console.dir(result, { depth: null });

        console.log("\nChecking database...");

        const dbResult = await pool.query(`
            SELECT
                id,
                network,
                plan_id,
                plan_code,
                plan_name,
                cost_price,
                sell_price,
                provider_plan_id,
                provider,
                is_active
            FROM data_plans
            WHERE provider = 'ERICODATA'
              AND network = 'MTN'
            ORDER BY sell_price
            LIMIT 20
        `);

        console.log("\nERICODATA MTN plans in database:");

        console.table(dbResult.rows);

        console.log(
            `\nTotal ERICODATA MTN plans in database: ${dbResult.rows.length}`
        );

        console.log("\n✅ ERICODATA sync test completed.");

    } catch (error) {

        console.error(
            "\n❌ ERICODATA sync failed:"
        );

        console.error(error);

        process.exitCode = 1;

    } finally {

        await pool.end();

    }
}

test();