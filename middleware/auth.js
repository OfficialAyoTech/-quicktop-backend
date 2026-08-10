const auth = require("../config/firebase");
const UserModel = require("../models/userModel");

const authenticateUser = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. No token provided."
            });
        }

        const idToken = authHeader.replace("Bearer ", "").trim();

        // Verify Firebase token
const decodedToken = await auth.verifyIdToken(idToken);

const dbUser = await UserModel.findByFirebaseUid(decodedToken.uid);

if (!dbUser) {
    return res.status(401).json({
        success: false,
        message: "User account not found."
    });
}

if (dbUser.account_status === "DELETED") {
    return res.status(403).json({
        success: false,
        message: "This account has been deleted."
    });
}

if (dbUser.account_status !== "ACTIVE") {
    return res.status(403).json({
        success: false,
        message: `Your account is ${dbUser.account_status.toLowerCase()}. Please contact support.`
    });
}

req.user = {
    uid: decodedToken.uid,
    id: dbUser.id,

    // Identity
    email: dbUser.email,
    full_name: dbUser.full_name,
    phone: dbUser.phone,

    // Firebase display name
    name: decodedToken.name || dbUser.full_name,

    // Role
    role: dbUser.role,

    // Account
    is_verified: dbUser.is_verified,
    account_status: dbUser.account_status
};

next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = authenticateUser;