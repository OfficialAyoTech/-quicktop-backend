const express = require("express");

const router = express.Router();

const authenticateUser =
    require("../middleware/auth");

const PinController =
    require("../controllers/pinController");

/**
 * @swagger
 * /api/pin/create:
 *   post:
 *     summary: Create a transaction PIN
 *     description: Creates a 4-digit transaction PIN for the authenticated user. This can only be done once.
 *     tags:
 *       - Transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Transaction PIN created successfully.
 *       400:
 *         description: Validation error or PIN already exists.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/create",
    authenticateUser,
    PinController.createPin
);

/**
 * @swagger
 * /api/pin/verify:
 *   post:
 *     summary: Verify transaction PIN
 *     description: Verifies the user's transaction PIN before performing a secured transaction.
 *     tags:
 *       - Transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: PIN verified successfully.
 *       400:
 *         description: Invalid PIN.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/verify",
    authenticateUser,
    PinController.verifyPin
);

/**
 * @swagger
 * /api/pin/change:
 *   patch:
 *     summary: Change transaction PIN
 *     description: Changes the authenticated user's transaction PIN.
 *     tags:
 *       - Transaction PIN
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPin
 *               - newPin
 *             properties:
 *               oldPin:
 *                 type: string
 *                 example: "1234"
 *               newPin:
 *                 type: string
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: Transaction PIN changed successfully.
 *       400:
 *         description: Invalid request.
 *       401:
 *         description: Unauthorized.
 */
router.patch(
    "/change",
    authenticateUser,
    PinController.changePin
);

/**
 * @swagger
 * /api/pin/status:
 *   get:
 *     summary: Get transaction PIN status
 *     description: Returns whether the authenticated user has created a transaction PIN.
 *     tags:
 *       - Transaction PIN
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PIN status retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/status",
    authenticateUser,
    PinController.getStatus
);

module.exports = router;