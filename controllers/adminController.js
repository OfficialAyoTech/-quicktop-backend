const AdminService = require("../services/adminService");
const ApiResponse = require("../helpers/apiResponse");
const ServiceStatusService = require("../services/serviceStatusService");
const DataPlanSyncService = require("../services/dataPlanSyncService");
const pool = require("../config/database");

/**
 * Admin Dashboard
 */
const getDashboard = async (req, res) => {

    try {

        const dashboard =
            await AdminService.getDashboard();

        return ApiResponse.success(
            res,
            "Dashboard retrieved successfully.",
            dashboard
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            500
        );

    }

};

/**
 * Get all KYC submissions
 */
const getAllKyc = async (req, res) => {

    try {

        const result =
            await AdminService.getAllKyc();

        return ApiResponse.success(
            res,
            "KYC records retrieved successfully.",
            result
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            500
        );

    }

};

/**
 * Get single KYC
 */
const getKycById = async (req, res) => {

    try {

        const result =
            await AdminService.getKycById(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "KYC retrieved successfully.",
            result
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            500
        );

    }

};

/**
 * Approve KYC
 */
const approveKyc = async (req, res) => {

    try {

        const result =
            await AdminService.approveKyc(
                req.params.id,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            500
        );

    }

};

/**
 * Reject KYC
 */
const rejectKyc = async (req, res) => {

    try {

        const result =
            await AdminService.rejectKyc(
                req.params.id,
                req.body.reason,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            500
        );

    }

};

/**
 * Get all users
 */
const getUsers = async (req, res) => {

    try {

        const users =
            await AdminService.getUsers(req.query);

        return ApiResponse.success(
            res,
            "Users retrieved successfully.",
            users
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get all wallets
 */
const getWallets = async (req, res) => {

    try {

        const wallets =
            await AdminService.getWallets();

        return ApiResponse.success(
            res,
            "Wallets retrieved successfully.",
            wallets
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get single wallet
 */
const getWallet = async (req, res) => {

    try {

        const wallet =
            await AdminService.getWalletByUserId(
                req.params.userId
            );

        return ApiResponse.success(
            res,
            "Wallet retrieved successfully.",
            wallet
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            404
        );

    }

};

/**
 * Get single user
 */
const getUserById = async (req, res) => {

    try {

        const user =
            await AdminService.getUserById(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "User retrieved successfully.",
            user
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Suspend user
 */
const suspendUser = async (req, res) => {

    try {

        const result =
            await AdminService.suspendUser(
                req.params.id,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Activate user
 */
const activateUser = async (req, res) => {

    try {

        const result =
            await AdminService.activateUser(
                req.params.id,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Credit wallet
 */
const creditWallet = async (req, res) => {

    try {

        const result =
            await AdminService.creditWallet(
                req.params.userId,
                req.body.amount,
                req.body.reason,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Debit wallet
 */
const debitWallet = async (req, res) => {

    try {

        const result =
            await AdminService.debitWallet(

                req.params.userId,

                req.body.amount,

                req.body.reason,

                req.user

            );

        return ApiResponse.success(

            res,

            result.message,

            result

        );

    } catch (error) {

        return ApiResponse.error(

            res,

            error.message,

            400

        );

    }

};

/**
 * Get all transactions
 */
const getTransactions = async (req, res) => {

    try {

        const transactions =
            await AdminService.getTransactions(req.query);

        return ApiResponse.success(
            res,
            "Transactions retrieved successfully.",
            transactions
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get single transaction
 */
const getTransaction = async (req, res) => {

    try {

        const transaction =
            await AdminService.getTransaction(
                req.params.reference
            );

        return ApiResponse.success(
            res,
            "Transaction retrieved successfully.",
            transaction
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            404
        );

    }

};

/**
 * Reverse transaction
 */
const reverseTransaction = async (req, res) => {

    try {

        const result =
            await AdminService.reverseTransaction(
                req.params.reference,
                req.user
            );

        return ApiResponse.success(
            res,
            result.message,
            result
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get all service statuses
 */
const getServiceStatuses = async (req, res) => {

    try {

        const statuses =
            await ServiceStatusService.getAll();

        return ApiResponse.success(
            res,
            "Service statuses retrieved successfully.",
            statuses
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Toggle a service on/off
 */
const toggleService = async (req, res) => {

    try {

        const result =
            await ServiceStatusService.setEnabled(
                req.params.name,
                req.body.is_enabled,
                req.user
            );

        return ApiResponse.success(
            res,
            `Service ${result.is_enabled ? "enabled" : "disabled"} successfully.`,
            result
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Sync data plans from Clubkonnect
 */
const syncDataPlans = async (req, res) => {

    try {

        const result =
            await DataPlanSyncService.syncFromClubkonnect();

        return ApiResponse.success(
            res,
            `Sync complete: ${result.inserted} new plans added, ${result.updated} existing plans updated.`,
            result
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get all data plans with cost/sell/margin
 */
const getDataPlansAdmin = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, network, plan_id, plan_code, plan_name,
                    cost_price, sell_price,
                    (sell_price - cost_price) AS margin,
                    is_active
             FROM data_plans
             ORDER BY network, cost_price`
        );

        return ApiResponse.success(
            res,
            "Data plans retrieved successfully.",
            result.rows
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Update a data plan's sell price
 */
const updateDataPlanPrice = async (req, res) => {

    try {

        const { id } = req.params;
        const { sell_price } = req.body;

        if (sell_price === undefined || Number(sell_price) < 0) {
            throw new Error("A valid sell_price is required.");
        }

        const result = await pool.query(
            `UPDATE data_plans
             SET sell_price = $1, updated_at = now()
             WHERE id = $2
             RETURNING *`,
            [sell_price, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Data plan not found.");
        }

        return ApiResponse.success(
            res,
            "Sell price updated successfully.",
            result.rows[0]
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get all cable packages with cost/sell/margin
 */
const getCablePackagesAdmin = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, provider, package_name, package_code,
                    cost_price, sell_price,
                    (sell_price - cost_price) AS margin,
                    is_active
             FROM cable_packages
             ORDER BY provider, cost_price`
        );

        return ApiResponse.success(
            res,
            "Cable packages retrieved successfully.",
            result.rows
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Update a cable package's sell price
 */
const updateCablePackagePrice = async (req, res) => {

    try {

        const { id } = req.params;
        const { sell_price } = req.body;

        if (sell_price === undefined || Number(sell_price) < 0) {
            throw new Error("A valid sell_price is required.");
        }

        const result = await pool.query(
            `UPDATE cable_packages
             SET sell_price = $1, updated_at = now()
             WHERE id = $2
             RETURNING *`,
            [sell_price, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Cable package not found.");
        }

        return ApiResponse.success(
            res,
            "Sell price updated successfully.",
            result.rows[0]
        );

    } catch (error) {

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

module.exports = {
    getDashboard,
    getAllKyc,
    getKycById,
    approveKyc,
    rejectKyc,
    getUsers,
    getUserById,
    suspendUser,
    activateUser,
    getWallets,
    getWallet,
    creditWallet,
    debitWallet,
    getTransactions,
    getTransaction,
    reverseTransaction,
    getServiceStatuses,
    toggleService,
    syncDataPlans,
    getDataPlansAdmin,
    updateDataPlanPrice,
    getCablePackagesAdmin,
    updateCablePackagePrice
};