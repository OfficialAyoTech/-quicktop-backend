const express = require("express");
const TransferController = require("../controllers/transferController");
const authenticate = require("../middleware/auth");

const router = express.Router();

/**
 * Wallet Transfer
 */
router.post(
    "/",
    authenticate,
    TransferController.transfer
);

module.exports = router;