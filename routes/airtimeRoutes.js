const express = require("express");
const router = express.Router();

const { purchaseAirtime } = require("../controllers/airtimeController");
const authenticateUser = require("../middleware/auth");
const validateAirtimeRequest = require("../validators/airtimeValidator");

// POST /api/airtime/purchase
router.post(
    "/purchase",
    authenticateUser,
    validateAirtimeRequest,
    purchaseAirtime
);

module.exports = router;