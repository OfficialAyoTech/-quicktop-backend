const TransferService = require("../services/transferService");

class TransferController {

    /**
     * Transfer money
     */
    static async transfer(req, res, next) {

        // Wallet-to-wallet transfer is disabled — this is a payments/remittance
        // service requiring CBN licensing (PSP license or a licensed partner)
        // that QuickTop does not yet hold. Do not re-enable without confirming
        // licensing is in place.
        return res.status(503).json({
            success: false,
            message: "This feature is currently unavailable."
        });

        try {

        const result = await TransferService.transfer(
                req.user.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Transfer successful.",
                data: result
            });

        } catch (error) {
            next(error);
        }

    }

}

module.exports = TransferController;