const AdminModel = require("../models/adminModel");
const KycModel = require("../models/kycModel");
const UserModel = require("../models/userModel");
const NotificationService = require("./notificationService");
const AdminActionModel = require("../models/adminActionModel");

const pool = require("../config/database");
const WalletModel = require("../models/walletModel");
const WalletLedgerModel = require("../models/walletLedgerModel");
const TransactionModel = require("../models/transactionModel");
const generateReference = require("../utils/referenceGenerator");

class AdminService {

    /**
     * Get Admin Dashboard
     */
    static async getDashboard() {

        const stats = await AdminModel.getDashboard();

        return {
            total_users: Number(stats.total_users),
            active_users: Number(stats.active_users),
            pending_kyc: Number(stats.pending_kyc),
            verified_kyc: Number(stats.verified_kyc),
            total_wallet_balance: Number(stats.total_wallet_balance),
            total_transactions: Number(stats.total_transactions),
            today_transactions: Number(stats.today_transactions)
        };

    }

    /**
     * Get all KYC submissions
     */
    static async getAllKyc() {

        return await KycModel.findAll();

    }

    /**
     * Get single KYC
     */
    static async getKycById(id) {

        return await KycModel.findById(id);

    }

    /**
     * Approve KYC
     */
    static async approveKyc(id, admin) {

        const kyc = await KycModel.findById(id);

        if (!kyc) {
            throw new Error("KYC record not found.");
        }

        if (kyc.verification_status === "VERIFIED") {
            throw new Error("KYC has already been approved.");
        }

        if (kyc.verification_status === "REJECTED") {
            throw new Error("Rejected KYC cannot be approved.");
        }

        await KycModel.approve(id);

        await UserModel.updateVerificationStatus(
            kyc.user_id,
            true
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "KYC_APPROVE",
            target_type: "kyc",
            target_id: id,
            details: { user_id: kyc.user_id }
        });

        await NotificationService.notify({
            user_id: kyc.user_id,
            title: "✅ KYC Approved",
            message: "Your identity verification has been approved. You now have full access to QuickTop.",
            type: "SUCCESS",
            category: "kyc"
        });

        return {
            message: "KYC approved successfully."
        };

    }

    /**
     * Reject KYC
     */
    static async rejectKyc(id, reason, admin) {

        const kyc = await KycModel.findById(id);

        if (!kyc) {
            throw new Error("KYC record not found.");
        }

        if (kyc.verification_status === "REJECTED") {
            throw new Error("KYC has already been rejected.");
        }

        if (kyc.verification_status === "VERIFIED") {
            throw new Error("Verified KYC cannot be rejected.");
        }

        await KycModel.reject(id, reason);

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "KYC_REJECT",
            target_type: "kyc",
            target_id: id,
            details: { user_id: kyc.user_id, reason }
        });

        await NotificationService.notify({
            user_id: kyc.user_id,
            title: "❌ KYC Rejected",
            message: reason,
            type: "FAILED",
            category: "kyc"
        });

        return {
            message: "KYC rejected successfully."
        };

    }

    /**
     * Get users with pagination, search and filters
     */
    static async getUsers(query) {

        const options = {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
            search: query.search || "",
            role: query.role,
            status: query.status,
            verified:
                query.verified === undefined
                    ? undefined
                    : query.verified === "true"
        };

        return await AdminModel.getUsers(options);

    }

    /**
     * Get all wallets
     */
    static async getWallets() {

        return await AdminModel.getWallets();

    }

    /**
     * Get single wallet
     */
    static async getWalletByUserId(userId) {

        const wallet = await AdminModel.getWalletByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        return wallet;

    }

    /**
     * Get single user
     */
    static async getUserById(id) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;

    }

    /**
     * Suspend user
     */
    static async suspendUser(id, admin) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        if (user.role === "ADMIN") {
            throw new Error("Admin account cannot be suspended.");
        }

        if (user.account_status === "SUSPENDED") {
            throw new Error("User is already suspended.");
        }

        await AdminModel.updateUserStatus(
            id,
            "SUSPENDED"
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "USER_SUSPEND",
            target_type: "user",
            target_id: id
        });

        await NotificationService.notify({
            user_id: id,
            title: "🚫 Account Suspended",
            message: "Your QuickTop account has been suspended. Please contact support.",
            type: "FAILED",
            category: "account"
        });

        return {
            message: "User suspended successfully."
        };

    }

    /**
     * Activate user
     */
    static async activateUser(id, admin) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        if (user.account_status === "ACTIVE") {
            throw new Error("User is already active.");
        }

        await AdminModel.updateUserStatus(
            id,
            "ACTIVE"
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "USER_ACTIVATE",
            target_type: "user",
            target_id: id
        });

        await NotificationService.notify({
            user_id: id,
            title: "🎉 Account Activated",
            message: "Your QuickTop account has been reactivated.",
            type: "SUCCESS",
            category: "account"
        });

        return {
            message: "User activated successfully."
        };

    }

    /**
     * Credit User Wallet (Admin)
     */
    static async creditWallet(
        userId,
        amount,
        narration = "Admin Wallet Credit",
        admin
    ) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const wallet = await WalletModel.findByUserId(
                userId,
                client
            );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            const balanceAfter =
                balanceBefore + Number(amount);

            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reference =
                generateReference("ADMINCR");

            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "credit",

                source: "ADMIN",

                service: "ADMIN_CREDIT",

                amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference,

                description: narration,

                status: "successful"

            }, client);

            await TransactionModel.create({

                user_id: userId,

                reference,

                provider: "ADMIN",

                service: "ADMIN_CREDIT",

                amount,

                status: "successful",

                transaction_type: "ADMIN",

                narration,

                balance_after: balanceAfter,

                api_response: {
                    source: "ADMIN"
                }

            }, client);

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "WALLET_CREDIT",
                target_type: "user",
                target_id: userId,
                details: {
                    amount,
                    narration,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            await NotificationService.notify({

                user_id: userId,

                title: "💰 Wallet Credited",

                message: `₦${amount} has been credited to your wallet by the administrator.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {
                message: "Wallet credited successfully.",
                reference,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

    /**
     * Debit User Wallet (Admin)
     */
    static async debitWallet(
        userId,
        amount,
        narration = "Admin Wallet Debit",
        admin
    ) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            // Find wallet
            const wallet = await WalletModel.findByUserId(
                userId,
                client
            );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            // Lock wallet
            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            // Prevent overdraft
            if (balanceBefore < Number(amount)) {
                throw new Error("Insufficient wallet balance.");
            }

            const balanceAfter =
                balanceBefore - Number(amount);

            // Update wallet
            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reference =
                generateReference("ADMINDB");

            // Wallet Ledger
            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "debit",

                source: "ADMIN",

                service: "ADMIN_DEBIT",

                amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference,

                description: narration,

                status: "successful"

            }, client);

            // Transaction
            await TransactionModel.create({

                user_id: userId,

                reference,

                provider: "ADMIN",

                service: "ADMIN_DEBIT",

                amount,

                status: "successful",

                transaction_type: "ADMIN",

                narration,

                balance_after: balanceAfter,

                api_response: {
                    source: "ADMIN"
                }

            }, client);

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "WALLET_DEBIT",
                target_type: "user",
                target_id: userId,
                details: {
                    amount,
                    narration,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            // Notification
            await NotificationService.notify({

                user_id: userId,

                title: "💸 Wallet Debited",

                message: `₦${amount} has been deducted from your wallet by the administrator.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {
                message: "Wallet debited successfully.",
                reference,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

    /**
     * Get all transactions
     */
    static async getTransactions(query) {

        return await AdminModel.getTransactions({

            page: Number(query.page) || 1,

            limit: Number(query.limit) || 20,

            status: query.status,

            service: query.service,

            provider: query.provider,

            transaction_type: query.transaction_type,

            search: query.search

        });

    }

    /**
     * Get single transaction
     */
    static async getTransaction(reference) {

        const transaction =
            await AdminModel.getTransaction(reference);

        if (!transaction) {

            throw new Error("Transaction not found.");

        }

        return transaction;

    }

    /**
     * Reverse transaction
     */
    static async reverseTransaction(reference, admin) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            // Find original transaction
            const transaction =
                await TransactionModel.getByReference(
                    reference,
                    client
                );

            if (!transaction) {
                throw new Error("Transaction not found.");
            }

            if (transaction.status !== "successful") {
                throw new Error(
                    "Only successful transactions can be reversed."
                );
            }

            // Find user's wallet
            const wallet =
                await WalletModel.findByUserId(
                    transaction.user_id,
                    client
                );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            // Lock wallet
            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            const balanceAfter =
                balanceBefore + Number(transaction.amount);

            // Credit wallet back
            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reversalReference =
                generateReference("REV");

            // Wallet Ledger
            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "credit",

                source: "ADMIN",

                service: "REVERSAL",

                amount: transaction.amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference: reversalReference,

                description: `Reversal of ${transaction.reference}`,

                status: "successful"

            }, client);

            // Reversal Transaction
            await TransactionModel.create({

                user_id: transaction.user_id,

                reference: reversalReference,

                provider: "ADMIN",

                service: "REVERSAL",

                amount: transaction.amount,

                status: "successful",

                transaction_type: "REVERSAL",

                narration:
                    `Reversal of ${transaction.reference}`,

                balance_after: balanceAfter,

                api_response: {
                    reversed_reference: transaction.reference
                }

            }, client);

            // Mark original transaction
            await TransactionModel.changeStatus(
                transaction.reference,
                "reversed",
                client
            );

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "TRANSACTION_REVERSE",
                target_type: "transaction",
                target_id: transaction.reference,
                details: {
                    user_id: transaction.user_id,
                    amount: transaction.amount,
                    reversal_reference: reversalReference
                }
            }, client);

            // Notify user
            await NotificationService.notify({

                user_id: transaction.user_id,

                title: "↩️ Transaction Reversed",

                message:
                    `₦${transaction.amount} has been refunded to your wallet.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {

                message: "Transaction reversed successfully.",

                reversal_reference: reversalReference

            };

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    }

}

module.exports = AdminService;