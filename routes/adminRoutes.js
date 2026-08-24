const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const adminController = require("../controllers/adminController");

const {
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
    syncDataPlans,
    getDataPlansAdmin,
    updateDataPlanPrice
} = require("../controllers/adminController");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin Dashboard
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Admin access required
 */
router.get(
    "/dashboard",
    auth,
    admin,
    adminController.getDashboard
);

/**
 * Get all KYC submissions
 */
router.get(
    "/kyc",
    auth,
    admin,
    adminController.getAllKyc
);

/**
 * Get single KYC
 */
router.get(
    "/kyc/:id",
    auth,
    admin,
    adminController.getKycById
);

/**
 * Approve KYC
 */
router.patch(
    "/kyc/:id/approve",
    auth,
    admin,
    adminController.approveKyc
);

/**
 * Reject KYC
 */
router.patch(
    "/kyc/:id/reject",
    auth,
    admin,
    adminController.rejectKyc
);

/**
 * Get all users
 */
router.get(
    "/users",
    auth,
    admin,
    adminController.getUsers
);

/**
 * Get single user
 */
router.get(
    "/users/:id",
    auth,
    admin,
    adminController.getUserById
);

/**
 * Suspend user
 */
router.patch(
    "/users/:id/suspend",
    auth,
    admin,
    adminController.suspendUser
);

/**
 * Activate user
 */
router.patch(
    "/users/:id/activate",
    auth,
    admin,
    adminController.activateUser
);

/**
 * Wallet Management
 */
router.get(
    "/wallets",
    auth,
    admin,
    getWallets
);

router.get(
    "/wallets/:userId",
    auth,
    admin,
    getWallet
);

router.post(
    "/wallets/:userId/credit",
    auth,
    admin,
    creditWallet
);

router.post(
    "/wallets/:userId/debit",
    auth,
    admin,
    debitWallet
);

/**
 * Get all transactions
 */
router.get(
    "/transactions",
    auth,
    admin,
    adminController.getTransactions
);

/**
 * Get single transaction
 */
router.get(
    "/transactions/:reference",
    auth,
    admin,
    adminController.getTransaction
);

/**
 * Reverse transaction
 */
router.post(
    "/transactions/:reference/reverse",
    auth,
    admin,
    reverseTransaction
);

/**
 * Service Management
 */
router.get(
    "/services",
    auth,
    admin,
    adminController.getServiceStatuses
);

router.patch(
    "/services/:name/toggle",
    auth,
    admin,
    adminController.toggleService
);

/**
 * Data Plans Management
 */
router.post(
    "/data-plans/sync",
    auth,
    admin,
    adminController.syncDataPlans
);

router.get(
    "/data-plans",
    auth,
    admin,
    adminController.getDataPlansAdmin
);

router.patch(
    "/data-plans/:id/price",
    auth,
    admin,
    adminController.updateDataPlanPrice
);

/**
 * Cable Packages Management
 */
router.get(
    "/cable-packages",
    auth,
    admin,
    adminController.getCablePackagesAdmin
);

router.patch(
    "/cable-packages/:id/price",
    auth,
    admin,
    adminController.updateCablePackagePrice
);

/**
 * Cashback Rates Management
 */
router.get(
    "/cashback-rates",
    auth,
    admin,
    adminController.getCashbackRates
);

router.patch(
    "/cashback-rates/:service",
    auth,
    admin,
    adminController.updateCashbackRate
);

router.patch(
    "/data-plans/:id/promotional",
    auth,
    admin,
    adminController.updateDataPlanPromo
);

router.patch(
    "/cable-packages/:id/promotional",
    auth,
    admin,
    adminController.updateCablePackagePromo
);

/**
 * WAEC Packages Management
 */
router.get(
    "/waec-packages",
    auth,
    admin,
    adminController.getWaecPackagesAdmin
);

router.patch(
    "/waec-packages/:id/price",
    auth,
    admin,
    adminController.updateWaecPackagePrice
);

/**
 * Legal Documents Management (Privacy Policy, Terms of Service)
 */
router.get(
    "/legal-docs",
    auth,
    admin,
    adminController.getLegalDocs
);

router.patch(
    "/legal-docs/:docKey",
    auth,
    admin,
    adminController.updateLegalDoc
);

router.post(
    "/provider-accounts/:provider/topup",
    auth,
    admin,
    adminController.topupProviderCapital
);

router.post(
    "/provider-accounts/:provider/reconcile",
    auth,
    admin,
    adminController.reconcileProviderCapital
);

router.post(
    "/expenses",
    auth,
    admin,
    adminController.createExpense
);

router.get(
    "/expenses",
    auth,
    admin,
    adminController.getExpenses
);

router.get(
    "/withdrawals/available",
    auth,
    admin,
    adminController.getWithdrawableProfit
);

router.post(
    "/withdrawals",
    auth,
    admin,
    adminController.requestWithdrawal
);

router.patch(
    "/withdrawals/:reference/resolve",
    auth,
    admin,
    adminController.resolveWithdrawal
);

router.get(
    "/financial-overview",
    auth,
    admin,
    adminController.getFinancialOverview
);

/**
 * Paystack Settlement Tracking
 */
router.post(
    "/transactions/:reference/reverse-funding",
    auth,
    admin,
    adminController.reverseWalletFunding
);

router.post(
    "/settlements/sync",
    auth,
    admin,
    adminController.syncSettlements
);

router.get(
    "/settlements",
    auth,
    admin,
    adminController.getSettlements
);

module.exports = router;