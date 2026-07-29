const express = require("express");

const router = express.Router();

const authenticateUser =
    require("../middleware/auth");

const DashboardController =
    require("../controllers/dashboardController");

// Dashboard Home
router.get(
    "/",
    authenticateUser,
    DashboardController.getDashboard
);

// Dashboard Summary
router.get(
    "/summary",
    authenticateUser,
    DashboardController.getSummary
);

// Service Analytics
router.get(
    "/services",
    authenticateUser,
    DashboardController.getServiceAnalytics
);

// Monthly Analytics
router.get(
    "/monthly",
    authenticateUser,
    DashboardController.getMonthlyAnalytics
);

// Recent Transactions
router.get(
    "/recent",
    authenticateUser,
    DashboardController.getRecentTransactions
);

module.exports = router;