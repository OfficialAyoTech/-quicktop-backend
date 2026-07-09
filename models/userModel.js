const pool = require("../config/database");

const findUserByFirebaseUid = async (firebaseUid) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE firebase_uid = $1",
        [firebaseUid]
    );

    return result.rows[0];
};

const createUser = async (client, userData) => {
    const result = await client.query(
        `INSERT INTO users
        (firebase_uid, full_name, email, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            userData.firebaseUid,
            userData.fullName,
            userData.email,
            userData.phone,
        ]
    );

    return result.rows[0];
};

module.exports = {
    findUserByFirebaseUid,
    createUser,
};