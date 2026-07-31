const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const ReferralController =
    require("../controllers/referralController");

/**
 * Get referral dashboard
 */
router.get(
    "/",
    auth,
    ReferralController.getReferralDashboard
);

module.exports = router;