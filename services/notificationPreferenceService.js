const NotificationPreferenceModel = require("../models/notificationPreferenceModel");
const AppError = require("../helpers/AppError");

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

const CATEGORY_TO_COLUMN = {
    purchase: "purchase_enabled",
    wallet: "wallet_enabled",
    promotion: "promotions_enabled"
};

class NotificationPreferenceService {

    /**
     * Get preferences
     */
    static async getPreferences(userId) {

        return await NotificationPreferenceModel.getOrCreate(userId);

    }

    /**
     * Update preferences
     */
    static async updatePreferences(userId, payload) {

        const { purchase_enabled, wallet_enabled, promotions_enabled } = payload;

        for (const [key, value] of Object.entries({
            purchase_enabled, wallet_enabled, promotions_enabled
        })) {
            if (value !== undefined && typeof value !== "boolean") {
                throw new ValidationError(`${key} must be true or false.`);
            }
        }

        return await NotificationPreferenceModel.update(userId, {
            purchase_enabled,
            wallet_enabled,
            promotions_enabled
        });

    }

    /**
     * Check if a category is enabled for a user.
     * Fails OPEN (returns true) if category is unrecognized or lookup fails —
     * a missing preference row should never silently swallow a real notification.
     */
    static async isEnabled(userId, category) {

        const column = CATEGORY_TO_COLUMN[category];
        if (!column) return true;

        try {
            const prefs = await NotificationPreferenceModel.getOrCreate(userId);
            return prefs[column] !== false;
        } catch (e) {
            return true;
        }

    }

}

module.exports = NotificationPreferenceService;