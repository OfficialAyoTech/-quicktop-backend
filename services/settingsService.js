const pool = require("../config/database");

class SettingsService {

    static async getAllSettings() {
        const result = await pool.query(`SELECT key, value FROM app_settings ORDER BY key`);
        const settings = {};
        result.rows.forEach(row => { settings[row.key] = row.value; });
        return settings;
    }

    static async updateSetting(key, value) {
        const result = await pool.query(
            `UPDATE app_settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING key, value`,
            [String(value), key]
        );
        if (result.rows.length === 0) {
            throw new Error(`Unknown setting key: ${key}`);
        }
        return result.rows[0];
    }

    static async updateManySettings(updates) {
        // updates = { key1: value1, key2: value2, ... }
        const keys = Object.keys(updates);
        const results = [];
        for (const key of keys) {
            const row = await this.updateSetting(key, updates[key]);
            results.push(row);
        }
        return results;
    }

}

module.exports = SettingsService;