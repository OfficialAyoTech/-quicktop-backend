const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");

const {
    getPlans
} = require("../controllers/dataPlansController");

// Get all data plans
router.get(
    "/",
    authenticateUser,
    getPlans
);

// Get plans for a specific network
router.get(
    "/:network",
    authenticateUser,
    getPlans
);

module.exports = router;