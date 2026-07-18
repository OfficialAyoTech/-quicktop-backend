const pool = require("../config/database");
const WalletModel = require("../models/walletModel");
const WalletLedgerService = require("./walletLedgerService");
const DatabaseTransaction = require("../helpers/databaseTransaction");

const {
    WALLET_TYPES,
    PAYMENT_SOURCES,
    SERVICES,
    TRANSACTION_STATUS
} = require("../utils/constants");

class WalletService {

    /**
     * Create wallet for a user
     */
    static async createWallet(userId, client = null) {

        const db = client || pool;

        const existingWallet = await WalletModel.findByUserId(userId, db);

        if (existingWallet) {
            return existingWallet;
        }

        return await WalletModel.create(userId, db);

    }

    /**
     * Get wallet
     */
    static async getWallet(userId, client = null) {

        let wallet = await WalletModel.findByUserId(
            userId,
            client || pool
        );

        if (!wallet) {
            wallet = await this.createWallet(userId, client);
        }

        return wallet;

    }

    /**
     * Get wallet balance
     */
    static async getBalance(userId) {

        const wallet = await this.getWallet(userId);

        return {
            balance: Number(wallet.balance),
            currency: wallet.currency
        };

    }

    /**
 * Credit wallet
 */
static async credit(userId, payload) {

    return DatabaseTransaction.run(async (client) => {
        return this.creditWithClient(userId, payload, client);
    });

}
/**
 * Credit wallet using an existing transaction
 */
static async creditWithClient(userId, payload, client) {

    const wallet = await this.getWallet(userId, client);

    const lockedWallet = await WalletModel.lockWallet(
        wallet.id,
        client
    );

    const balanceBefore = Number(lockedWallet.balance);

    const balanceAfter =
        balanceBefore + Number(payload.amount);

    const updatedWallet =
        await WalletModel.updateBalance(
            wallet.id,
            balanceAfter,
            client
        );

    await WalletLedgerService.record(
        {
            wallet_id: wallet.id,
            type: WALLET_TYPES.CREDIT,
            source: payload.source || PAYMENT_SOURCES.PAYSTACK,
            service: payload.service || SERVICES.WALLET_FUNDING,
            amount: payload.amount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            reference: payload.reference,
            description: payload.description,
            status: TRANSACTION_STATUS.SUCCESS
        },
        client
    );

    return updatedWallet;

}

    /**
 * Debit wallet
 */
static async debit(userId, payload) {

    return DatabaseTransaction.run(async (client) => {
        return this.debitWithClient(userId, payload, client);
    });

}
/**
 * Debit wallet using an existing transaction
 */
static async debitWithClient(userId, payload, client) {

    const wallet = await this.getWallet(userId, client);

    const lockedWallet = await WalletModel.lockWallet(
        wallet.id,
        client
    );

    const balanceBefore = Number(lockedWallet.balance);

    if (balanceBefore < Number(payload.amount)) {
        throw new Error("Insufficient wallet balance.");
    }

    const balanceAfter =
        balanceBefore - Number(payload.amount);

    const updatedWallet =
        await WalletModel.updateBalance(
            wallet.id,
            balanceAfter,
            client
        );

    await WalletLedgerService.record(
        {
            wallet_id: wallet.id,
            type: WALLET_TYPES.DEBIT,
            source: payload.source || PAYMENT_SOURCES.WALLET,
            service: payload.service,
            amount: payload.amount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            reference: payload.reference,
            description: payload.description,
            status: TRANSACTION_STATUS.SUCCESS
        },
        client
    );

    return updatedWallet;

}

}

module.exports = WalletService;