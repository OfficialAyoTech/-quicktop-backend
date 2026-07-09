const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");

const {
    walletBalance,
} = require("../controllers/walletController");

router.get(
    "/balance",
    authenticateUser,
    walletBalance
);

module.exports = router;