const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");

const TransactionController = require("../controllers/transactionController");

router.get(
    "/",
    authenticateUser,
    TransactionController.getTransactions
);

router.get(
    "/query/:reference",
    authenticateUser,
    TransactionController.queryTransaction
);

router.get(
    "/:reference",
    authenticateUser,
    TransactionController.getTransaction
);

module.exports = router;