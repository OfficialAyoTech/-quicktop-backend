const asyncHandler = require("../helpers/asyncHandler");
const ApiResponse = require("../helpers/apiResponse");
const WebhookService = require("../services/webhookService");

class WebhookController {

    /**
     * Handle Paystack Webhook
     * POST /api/payments/webhook
     */
    static handlePaystackWebhook = asyncHandler(async (req, res) => {

        await WebhookService.handlePaystackWebhook(req);

        return ApiResponse.success(
            res,
            "Webhook processed successfully."
        );

    });

}

module.exports = WebhookController;