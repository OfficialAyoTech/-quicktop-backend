const pool = require("../config/database");

const createWallet = async (client, userId) => {
    const result = await client.query(
        `INSERT INTO wallets (user_id)
         VALUES ($1)
         RETURNING *`,
        [userId]
    );

    return result.rows[0];
};

const getWalletByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT *
         FROM wallets
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    createWallet,
    getWalletByUserId,
};