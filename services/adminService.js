const AdminModel = require("../models/adminModel");
const KycModel = require("../models/kycModel");
const UserModel = require("../models/userModel");
const NotificationService = require("./notificationService");

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
    static async approveKyc(id) {

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
    static async rejectKyc(id, reason) {

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
static async suspendUser(id) {

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
static async activateUser(id) {

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

}

module.exports = AdminService;