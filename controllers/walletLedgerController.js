const WalletService = require("../services/walletService");
const WalletLedgerService = require("../services/walletLedgerService");
const ApiResponse = require("../helpers/apiResponse");

class WalletLedgerController {

    /**
     * Get wallet ledger history
     */
    static async getHistory(req, res, next) {

        try {

            // Get user's wallet
            const wallet = await WalletService.getWallet(req.user.id);

            // Get ledger records
            const history = await WalletLedgerService.getHistory(wallet.id);

            return ApiResponse.success(
                res,
                "Wallet history retrieved successfully.",
                history
            );

        } catch (error) {
            next(error);
        }

    }

}

module.exports = WalletLedgerController;