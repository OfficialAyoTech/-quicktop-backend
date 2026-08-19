const WalletService = require("../services/walletService");
const ApiResponse = require("../helpers/apiResponse");
const RewardsService = require("../services/rewardsService");

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

        /**
     * Get rewards balance
     */
    static async getRewardsBalance(req, res, next) {

        try {

            const rewards = await RewardsService.getBalance(req.user.id);

            return ApiResponse.success(
                res,
                "Rewards balance retrieved successfully.",
                { balance: Number(rewards.balance) }
            );

        } catch (error) {
            next(error);
        }

    }

}

module.exports = WalletController;