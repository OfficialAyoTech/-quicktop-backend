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

        // getDataPlansAdmin — add is_promotional to the column list
const result = await pool.query(
    `SELECT id, network, plan_id, plan_code, plan_name,
            cost_price, sell_price,
            (sell_price - cost_price) AS margin,
            is_active, is_promotional
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

        // getCablePackagesAdmin — same addition
const result = await pool.query(
    `SELECT id, provider, package_name, package_code,
            cost_price, sell_price,
            (sell_price - cost_price) AS margin,
            is_active, is_promotional
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

/**
 * Get all cashback rates
 */
const getCashbackRates = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT service_name, rate_percent, min_purchase_amount, is_enabled, updated_at
             FROM cashback_rates
             ORDER BY service_name`
        );

        return ApiResponse.success(
            res,
            "Cashback rates retrieved successfully.",
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
 * Update a cashback rate
 */
const updateCashbackRate = async (req, res) => {

    try {

        const { service } = req.params;
        const { rate_percent, min_purchase_amount, is_enabled } = req.body;

        if (rate_percent === undefined || Number(rate_percent) < 0 || Number(rate_percent) > 100) {
            throw new Error("A valid rate_percent between 0 and 100 is required.");
        }

        if (min_purchase_amount === undefined || Number(min_purchase_amount) < 0) {
            throw new Error("A valid min_purchase_amount is required.");
        }

        const result = await pool.query(
            `UPDATE cashback_rates
             SET rate_percent = $1, min_purchase_amount = $2, is_enabled = $3,
                 updated_by = $4, updated_at = now()
             WHERE service_name = $5
             RETURNING *`,
            [rate_percent, min_purchase_amount, is_enabled !== false, req.user.email, service]
        );

        if (result.rows.length === 0) {
            throw new Error("Cashback rate not found for this service.");
        }

        return ApiResponse.success(
            res,
            "Cashback rate updated successfully.",
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
 * Toggle a data plan's promotional flag
 */
const updateDataPlanPromo = async (req, res) => {

    try {

        const { id } = req.params;
        const { is_promotional } = req.body;

        const result = await pool.query(
            `UPDATE data_plans
             SET is_promotional = $1, updated_at = now()
             WHERE id = $2
             RETURNING *`,
            [Boolean(is_promotional), id]
        );

        if (result.rows.length === 0) {
            throw new Error("Data plan not found.");
        }

        return ApiResponse.success(
            res,
            "Promotional flag updated successfully.",
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
 * Toggle a cable package's promotional flag
 */
const updateCablePackagePromo = async (req, res) => {

    try {

        const { id } = req.params;
        const { is_promotional } = req.body;

        const result = await pool.query(
            `UPDATE cable_packages
             SET is_promotional = $1, updated_at = now()
             WHERE id = $2
             RETURNING *`,
            [Boolean(is_promotional), id]
        );

        if (result.rows.length === 0) {
            throw new Error("Cable package not found.");
        }

        return ApiResponse.success(
            res,
            "Promotional flag updated successfully.",
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
 * Get WAEC packages with cost/sell/margin
 */
const getWaecPackagesAdmin = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, name, variation_code,
                    cost_price, sell_price,
                    (sell_price - cost_price) AS margin,
                    is_active
             FROM waec_packages
             ORDER BY id`
        );

        return ApiResponse.success(
            res,
            "WAEC packages retrieved successfully.",
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
 * Update a WAEC package's sell price
 */
const updateWaecPackagePrice = async (req, res) => {

    try {

        const { id } = req.params;
        const { sell_price } = req.body;

        if (sell_price === undefined || Number(sell_price) < 0) {
            throw new Error("A valid sell_price is required.");
        }

        const result = await pool.query(
            `UPDATE waec_packages
             SET sell_price = $1, updated_at = now()
             WHERE id = $2
             RETURNING *`,
            [sell_price, id]
        );

        if (result.rows.length === 0) {
            throw new Error("WAEC package not found.");
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
 * Get all legal documents (Privacy Policy, Terms of Service) for the admin editor
 */
const getLegalDocs = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT doc_key, content, is_draft, updated_at
             FROM legal_docs
             ORDER BY doc_key`
        );

        return ApiResponse.success(
            res,
            "Legal documents retrieved successfully.",
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

const LEGAL_DOC_KEYS = ["privacy_policy", "terms_of_service"];

/**
 * Create or update a legal document. Upserts so the very first save for a
 * doc_key works even if the migration's seed row was somehow skipped.
 */
const updateLegalDoc = async (req, res) => {

    try {

        const { docKey } = req.params;
        const { content, is_draft } = req.body;

        if (!LEGAL_DOC_KEYS.includes(docKey)) {
            throw new Error("Unknown legal document key.");
        }

        if (!content || !content.trim()) {
            throw new Error("Content cannot be empty.");
        }

        const result = await pool.query(
            `INSERT INTO legal_docs (doc_key, content, is_draft, updated_by, updated_at)
             VALUES ($1, $2, $3, $4, now())
             ON CONFLICT (doc_key) DO UPDATE
             SET content = EXCLUDED.content,
                 is_draft = EXCLUDED.is_draft,
                 updated_by = EXCLUDED.updated_by,
                 updated_at = now()
             RETURNING doc_key, content, is_draft, updated_at`,
            [docKey, content, is_draft !== false, req.user.email]
        );

        return ApiResponse.success(
            res,
            "Legal document updated successfully.",
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

const topupProviderCapital = async (req, res) => {

    try {

        const result = await AdminService.topupProviderCapital(
            req.params.provider,
            req.body.amount,
            req.body.narration,
            req.user
        );

        return ApiResponse.success(res, result.message, result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const reconcileProviderCapital = async (req, res) => {

    try {

        const result = await AdminService.reconcileProviderCapital(
            req.params.provider,
            req.body.actual_balance,
            req.body.reason,
            req.user
        );

        return ApiResponse.success(res, result.message, result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const createExpense = async (req, res) => {

    try {

        const result = await AdminService.createExpense(
            req.body.category,
            req.body.amount,
            req.body.description,
            req.body.expense_date,
            req.user
        );

        return ApiResponse.success(res, result.message, result.expense);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const getExpenses = async (req, res) => {

    try {

        const result = await AdminService.getExpenses(req.query);

        return ApiResponse.success(res, "Expenses retrieved successfully.", result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const getWithdrawableProfit = async (req, res) => {

    try {

        const result = await AdminService.getWithdrawableProfit();
        return ApiResponse.success(res, "Withdrawable profit calculated.", result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const requestWithdrawal = async (req, res) => {

    try {

        const result = await AdminService.requestWithdrawal(
            req.body.amount,
            req.body.destination,
            req.body.notes,
            req.user
        );

        return ApiResponse.success(res, result.message, result.withdrawal);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const resolveWithdrawal = async (req, res) => {

    try {

        const result = await AdminService.resolveWithdrawal(
            req.params.reference,
            req.body.status,
            req.user
        );

        return ApiResponse.success(res, result.message, result.withdrawal);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const getFinancialOverview = async (req, res) => {

    try {

        const validRanges = ["today", "yesterday", "week", "last_week", "month", "last_month", "custom", "all"];
        const range = validRanges.includes(req.query.range) ? req.query.range : "all";

        const result = await AdminService.getFinancialOverview(
            range,
            req.query.from_date,
            req.query.to_date
        );

        return ApiResponse.success(res, "Financial overview retrieved successfully.", result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const reverseWalletFunding = async (req, res) => {

    try {

        const result = await AdminService.reverseWalletFunding(
            req.params.reference,
            req.user
        );

        return ApiResponse.success(res, result.message, result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const syncSettlements = async (req, res) => {

    try {

        const result = await AdminService.syncSettlements(req.user);

        return ApiResponse.success(res, result.message, result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

    }

};

const getSettlements = async (req, res) => {

    try {

        const result = await AdminService.getSettlements(req.query);

        return ApiResponse.success(res, "Settlements retrieved successfully.", result);

    } catch (error) {

        return ApiResponse.error(res, error.message, 400);

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
    reverseWalletFunding,
    getServiceStatuses,
    toggleService,
    syncDataPlans,
    getDataPlansAdmin,
    updateDataPlanPrice,
    getCablePackagesAdmin,
    updateCablePackagePrice,
    getWaecPackagesAdmin,
    updateWaecPackagePrice,
    getCashbackRates,
    updateCashbackRate,
    updateDataPlanPromo,
    updateCablePackagePromo,
    getLegalDocs,
    updateLegalDoc,
    topupProviderCapital,
    reconcileProviderCapital,
    createExpense,
    getExpenses,
    getWithdrawableProfit,
    requestWithdrawal,
    resolveWithdrawal,
    getFinancialOverview,
    syncSettlements,
    getSettlements
};