const pool = require("../config/database");
const crypto = require("crypto");

const {
    REFERRAL_STATUS
} = require("../utils/constants");

const syncUser = async (req, res) => {

    try {

        const {
            uid,
            email,
            full_name,
            email_verified
        } = req.user;

        const {
            referral_code
        } = req.body;

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

    let user = existingUser.rows[0];

    // Existing user has no referral code? Generate one.
    if (!user.referral_code) {

        let newReferralCode;

        while (true) {

            newReferralCode =
                "QT" +
                crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase();

            const existingCode = await pool.query(
                `
                SELECT id
                FROM users
                WHERE referral_code = $1
                `,
                [newReferralCode]
            );

            if (existingCode.rows.length === 0) {
                break;
            }

        }

        const updatedUser = await pool.query(
            `
            UPDATE users
            SET
                referral_code = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                newReferralCode,
                user.id
            ]
        );

        user = updatedUser.rows[0];

    }

    // Keep is_verified in sync with Firebase's live email_verified claim,
    // e.g. when the user clicks a verification link after signing up.
    if (Boolean(user.is_verified) !== Boolean(email_verified)) {

        const verifiedUpdate = await pool.query(
            `
            UPDATE users
            SET
                is_verified = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
            `,
            [
                email_verified,
                user.id
            ]
        );

        user = verifiedUpdate.rows[0];

    }

    return res.json({
        success: true,
        message: "User already exists",
        user
    });

}

        // Generate unique referral code
        let myReferralCode;

        while (true) {

            myReferralCode =
                "QT" +
                crypto
                    .randomBytes(4)
                    .toString("hex")
                    .toUpperCase();

            const existingCode = await pool.query(
                `
                SELECT id
                FROM users
                WHERE referral_code = $1
                `,
                [myReferralCode]
            );

            if (existingCode.rows.length === 0) {
                break;
            }

        }

        // Check referral code
        let referredBy = null;

        if (referral_code) {

            const referrer = await pool.query(
                `
                SELECT id
                FROM users
                WHERE referral_code = $1
                `,
                [referral_code.trim().toUpperCase()]
            );

            if (referrer.rows.length === 0) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid referral code."
                });

            }

            referredBy = referrer.rows[0].id;

        }

        // Create PostgreSQL user
        const newUser = await pool.query(
            `
            INSERT INTO users
            (
                firebase_uid,
                email,
                full_name,
                referral_code,
                referred_by,
                is_verified
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *;
            `,
            [
                uid,
                email,
                full_name || "QuickTop User",
                myReferralCode,
                referredBy,
                Boolean(email_verified)
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

        // Create referral record
        if (referredBy) {

            const existingReferral = await pool.query(
                `
                SELECT id
                FROM referrals
                WHERE referred_user_id = $1
                `,
                [newUser.rows[0].id]
            );

            if (existingReferral.rows.length === 0) {

                await pool.query(
                    `
                    INSERT INTO referrals
                    (
                        referrer_id,
                        referred_user_id,
                        reward,
                        status
                    )
                    VALUES ($1,$2,$3,$4);
                    `,
                    [
                        referredBy,
                        newUser.rows[0].id,
                        0,
                        REFERRAL_STATUS.PENDING
                    ]
                );

            }

        }

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