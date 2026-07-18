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

        // Check if user exists in PostgreSQL
        const dbUser = await UserModel.findByFirebaseUid(decodedToken.uid);

        // Attach Firebase user
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email,
            id: dbUser ? dbUser.id : null,
            full_name: dbUser ? dbUser.full_name : null
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