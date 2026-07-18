const TransferService = require("../services/transferService");

class TransferController {

    /**
     * Transfer money
     */
    static async transfer(req, res, next) {

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