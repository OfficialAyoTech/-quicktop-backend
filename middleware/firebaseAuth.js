const auth = require("../config/firebase");

const firebaseAuth = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. No token provided."
            });
        }

        const idToken = authHeader.replace("Bearer ", "").trim();

        const decodedToken = await auth.verifyIdToken(idToken);

        console.log("========== FIREBASE TOKEN ==========");
        console.log(decodedToken);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            full_name:
                decodedToken.name ||
                decodedToken.displayName ||
                "QuickTop User"
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

module.exports = firebaseAuth;