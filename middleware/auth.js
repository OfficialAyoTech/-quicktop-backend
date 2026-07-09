const { auth } = require("../config/firebase");

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

    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = decodedToken;

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