require("dotenv").config();

const pool = require("../config/database");

async function createUsersTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                firebase_uid VARCHAR(128) UNIQUE NOT NULL,
                full_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await pool.query(query);

        console.log("✅ Users table created successfully.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to create users table.");
        console.error(error);

        process.exit(1);
    }
}

createUsersTable();