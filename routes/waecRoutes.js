const express = require("express");
const router = express.Router();

const { purchaseWaec } = require("../controllers/waecController");
const authenticateUser = require("../middleware/auth");
const validateWaecRequest = require("../validators/waecValidator");

// POST /api/waec/purchase
router.post(
    "/purchase",
    authenticateUser,
    validateWaecRequest,
    purchaseWaec
);

module.exports = router;