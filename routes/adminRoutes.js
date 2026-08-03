const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const requireAdmin = require("../middleware/requireAdmin");

const adminController = require("../controllers/adminController");

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

module.exports = router;