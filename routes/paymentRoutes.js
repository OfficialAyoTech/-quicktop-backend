const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/paymentController");
const WebhookController = require("../controllers/webhookController");
const authenticateUser = require("../middleware/auth");

/**
 * Paystack Webhook
 * NOTE:
 * This route must NOT use authentication middleware.
 * Paystack servers call this endpoint directly.
 */
router.post(
    "/webhook",
    WebhookController.handlePaystackWebhook
);

/**
 * Initialize Payment
 */
router.post(
    "/initialize",
    authenticateUser,
    PaymentController.initializePayment
);

/**
 * Verify Payment
 */
router.post(
    "/verify",
    authenticateUser,
    PaymentController.verifyPayment
);

module.exports = router;