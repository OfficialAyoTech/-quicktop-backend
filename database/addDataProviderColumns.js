require("dotenv").config();

const pool = require("../config/database");

async function migrate() {
    console.log("Adding provider column to data_plans...");

    try {
        await pool.query(`
            ALTER TABLE data_plans
            ADD COLUMN IF NOT EXISTS provider VARCHAR(50)
            NOT NULL DEFAULT 'CLUBKONNECT';
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_data_plans_provider
            ON data_plans(provider);
        `);

        console.log("✅ Provider column added successfully.");
        console.log("✅ Existing plans remain CLUBKONNECT.");

    } catch (error) {
        console.error("❌ Migration failed:");
        console.error(error);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

migrate();