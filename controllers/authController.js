const pool = require("../config/database");

const syncUser = async (req, res) => {

    try {

        const {
            uid,
            email,
            full_name
        } = req.user;

        // Check if user already exists
        const existingUser = await pool.query(
            `
            SELECT *
            FROM users
            WHERE firebase_uid = $1
            `,
            [uid]
        );

        if (existingUser.rows.length > 0) {

            return res.json({
                success: true,
                message: "User already exists",
                user: existingUser.rows[0]
            });

        }

        // Create PostgreSQL user
        const newUser = await pool.query(
            `
            INSERT INTO users
            (
                firebase_uid,
                email,
                full_name
            )
            VALUES ($1,$2,$3)
            RETURNING *;
            `,
            [
                uid,
                email,
                full_name || "QuickTop User"
            ]
        );

        // Create wallet
        await pool.query(
            `
            INSERT INTO wallets
            (
                user_id,
                balance
            )
            VALUES ($1,$2);
            `,
            [
                newUser.rows[0].id,
                0
            ]
        );

        return res.status(201).json({
            success: true,
            message: "User synced successfully.",
            user: newUser.rows[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    syncUser
};