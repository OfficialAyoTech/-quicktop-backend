const WalletLedgerModel = require("../models/walletLedgerModel");

class WalletLedgerService {

    /**
     * Record wallet ledger entry
     */
    static async record(data, client = null) {

        return await WalletLedgerModel.create(
            data,
            client || undefined
        );

    }

    /**
     * Get wallet history
     */
    static async getHistory(walletId, limit = 20) {

        return await WalletLedgerModel.getHistory(
            walletId,
            limit
        );

    }

}

module.exports = WalletLedgerService;