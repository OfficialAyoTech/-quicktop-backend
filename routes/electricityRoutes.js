const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const validateElectricityRequest = require("../validators/electricityValidator");
const {
    verifyMeter,
    purchaseElectricity
} = require("../controllers/electricityController");

// Verify meter number
router.post(
    "/verify",
    authenticateUser,
    verifyMeter
);

// Purchase electricity
router.post(
    "/purchase",
    authenticateUser,
    validateElectricityRequest,
    purchaseElectricity
);

module.exports = router;