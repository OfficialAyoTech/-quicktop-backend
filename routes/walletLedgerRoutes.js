const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const WalletLedgerController = require("../controllers/walletLedgerController");

router.get(
    "/",
    authenticateUser,
    WalletLedgerController.getHistory
);

module.exports = router;