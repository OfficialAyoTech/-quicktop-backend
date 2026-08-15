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

module.exports = router;