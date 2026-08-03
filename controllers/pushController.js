const PushService = require("../services/pushService");
const asyncHandler = require("../helpers/asyncHandler");

class PushController {

    static saveSubscription = asyncHandler(async (req, res) => {

        const subscription = await PushService.saveSubscription(
            req.user.id,
            req.body.subscription
        );

        res.status(200).json({
            success: true,
            message: "Push subscription saved.",
            reference: null,
            data: subscription,
            errors: null
        });

    });

}

module.exports = PushController;