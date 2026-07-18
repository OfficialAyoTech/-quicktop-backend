const pool = require("../config/database");

class DatabaseTransaction {

    /**
     * Get a PostgreSQL client.
     */
    static async getClient() {
        return await pool.connect();
    }

    /**
     * Execute a callback inside a transaction.
     */
    static async run(callback) {

        const client = await this.getClient();

        try {

            await client.query("BEGIN");

            const result = await callback(client);

            await client.query("COMMIT");

            return result;

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

}

module.exports = DatabaseTransaction;