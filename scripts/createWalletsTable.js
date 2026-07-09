require("dotenv").config();

const pool = require("../config/database");

async function createWalletsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE,
                balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
            );
        `;

        await pool.query(query);

        console.log("✅ Wallets table created successfully.");

        process.exit(0);

    } catch (error) {
        console.error("❌ Failed to create wallets table.");
        console.error(error);

        process.exit(1);
    }
}

createWalletsTable();