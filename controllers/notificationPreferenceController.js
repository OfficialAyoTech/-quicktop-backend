const NotificationPreferenceService = require("../services/notificationPreferenceService");
const asyncHandler = require("../helpers/asyncHandler");

class NotificationPreferenceController {

    static getPreferences = asyncHandler(async (req, res) => {

        const prefs = await NotificationPreferenceService.getPreferences(req.user.id);

        res.status(200).json({
            success: true,
            message: "Preferences retrieved successfully.",
            reference: null,
            data: prefs,
            errors: null
        });

    });

    static updatePreferences = asyncHandler(async (req, res) => {

        const prefs = await NotificationPreferenceService.updatePreferences(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Preferences updated successfully.",
            reference: null,
            data: prefs,
            errors: null
        });

    });

}

module.exports = NotificationPreferenceController;