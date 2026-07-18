const WalletService = require("../services/walletService");
const ApiResponse = require("../helpers/apiResponse");

class WalletController {

    /**
     * Get user wallet
     */
    static async getWallet(req, res, next) {

        try {

            const wallet = await WalletService.getWallet(req.user.id);

            return ApiResponse.success(
                res,
                "Wallet retrieved successfully.",
                wallet
            );

        } catch (error) {
            next(error);
        }

    }

    /**
     * Get wallet balance
     */
    static async getBalance(req, res, next) {

        try {

            const balance = await WalletService.getBalance(req.user.id);

            return ApiResponse.success(
                res,
                "Wallet balance retrieved successfully.",
                balance
            );

        } catch (error) {
            next(error);
        }

    }

}

module.exports = WalletController;