const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profileController");
const auth = require("../middleware/auth");

// Get Profile
router.get(
    "/",
    auth,
    profileController.getProfile
);

// Update Profile
router.put(
    "/",
    auth,
    profileController.updateProfile
);

module.exports = router;