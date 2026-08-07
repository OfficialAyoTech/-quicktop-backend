const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const requireAdmin = require("../middleware/requireAdmin");

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
    reverseTransaction
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
    requireAdmin,
    adminController.getUsers
);

/**
 * Get single user
 */
router.get(
    "/users/:id",
    auth,
    requireAdmin,
    adminController.getUserById
);

/**
 * Suspend user
 */
router.patch(
    "/users/:id/suspend",
    auth,
    requireAdmin,
    adminController.suspendUser
);

/**
 * Activate user
 */
router.patch(
    "/users/:id/activate",
    auth,
    requireAdmin,
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

router.get(
    "/dashboard",
    (req, res, next) => {
        console.log("🔥 ADMIN DASHBOARD ROUTE HIT");
        next();
    },
    auth,
    admin,
    adminController.getDashboard
);

module.exports = router;