const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profileController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
    updateProfileSchema
} = require("../validators/profileValidator");

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
    validate(updateProfileSchema),
    profileController.updateProfile
);

module.exports = router;