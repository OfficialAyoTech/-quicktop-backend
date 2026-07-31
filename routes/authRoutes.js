const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middleware/firebaseAuth");
const { syncUser } = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/sync-user:
 *   post:
 *     summary: Synchronize authenticated Firebase user with QuickTop database
 *     description: Creates the user in PostgreSQL if they don't already exist and returns the user's profile.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User synchronized successfully.
 *       401:
 *         description: Unauthorized. Invalid or missing Firebase ID token.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/sync-user",
    firebaseAuth,
    syncUser
);

module.exports = router;