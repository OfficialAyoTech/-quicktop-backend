const express = require("express");
const router = express.Router();

const TransactionController = require("../controllers/transactionController");
const authenticateUser = require("../middleware/auth");

router.get(
    "/",
    authenticateUser,
    TransactionController.getTransactions
);

router.get(
    "/:reference",
    authenticateUser,
    TransactionController.getTransaction
);

module.exports = router;