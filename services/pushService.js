const webpush = require("../config/webpush");
const PushSubscriptionModel = require("../models/pushSubscriptionModel");
const AppError = require("../helpers/AppError");

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class PushService {

    static async saveSubscription(userId, subscription) {

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            throw new ValidationError("Invalid push subscription payload.");
        }

        return await PushSubscriptionModel.upsert(userId, subscription);

    }

    /**
     * Send a push notification to every device a user is subscribed on.
     * Never throws — a failed push must never break the purchase/wallet/
     * referral flow that triggered it.
     */
    static async sendToUser(userId, { title, message, url }) {

        try {

            const subs = await PushSubscriptionModel.findByUser(userId);
            if (!subs.length) return;

            const payload = JSON.stringify({
                title: title || "QuickTop",
                body: message || "",
                url: url || "/"
            });

            await Promise.all(subs.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: { p256dh: sub.p256dh, auth: sub.auth }
                        },
                        payload
                    );
                } catch (err) {
                    // 404/410 means the subscription is dead (browser data cleared,
                    // uninstalled, etc.) — clean it up so we stop trying.
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await PushSubscriptionModel.deleteByEndpoint(sub.endpoint);
                    } else {
                        console.error("Push send failed:", err.message);
                    }
                }
            }));

        } catch (error) {
            console.error("PushService.sendToUser error:", error);
        }

    }

}

module.exports = PushService;