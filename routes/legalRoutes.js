const express = require("express");
const router = express.Router();

const legalController = require("../controllers/legalController");

/**
 * @route GET /api/legal/:docKey
 * @desc  Public — fetch a published legal document
 *        (docKey: privacy_policy | terms_of_service)
 * No auth required — must be readable before signup/login.
 */
router.get(
    "/:docKey",
    legalController.getPublicLegalDoc
);

module.exports = router;