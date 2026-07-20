const express = require("express");
const router = express.Router();

const WalletController = require("../controllers/walletController");
const authenticateUser = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet management APIs
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get authenticated user's wallet
 *     description: Returns the wallet details of the currently authenticated user.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/",
    authenticateUser,
    WalletController.getWallet
);

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     description: Returns the current wallet balance of the authenticated user.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/balance",
    authenticateUser,
    WalletController.getBalance
);

module.exports = router;