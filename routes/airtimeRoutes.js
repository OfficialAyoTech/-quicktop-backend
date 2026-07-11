const express = require("express");
const router = express.Router();

const { purchaseAirtime } = require("../controllers/airtimeController");
const verifyFirebaseToken = require("../middleware/devAuth");
const validateAirtimeRequest = require("../validators/airtimeValidator");

// POST /api/airtime/purchase
router.post(
    "/purchase",
    devAuth,
    validateAirtimeRequest,
    purchaseAirtime
);

module.exports = router;