const express = require("express");
const router = express.Router();
const SettingsService = require("../services/settingsService");

// GET /api/settings — public, no auth (app needs this before login)
router.get("/", async (req, res) => {
    try {
        const settings = await SettingsService.getAllSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not load settings" });
    }
});

module.exports = router;