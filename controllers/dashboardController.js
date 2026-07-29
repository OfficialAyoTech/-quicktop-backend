const DashboardService = require("../services/dashboardService");
const asyncHandler = require("../helpers/asyncHandler");

class DashboardController {

    /**
     * Dashboard Home
     */
    static getDashboard = asyncHandler(async (req, res) => {

        const data = await DashboardService.getDashboard(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Dashboard loaded successfully.",
            reference: null,
            data,
            errors: null
        });

    });

    /**
     * Dashboard Summary
     */
    static getSummary = asyncHandler(async (req, res) => {

        const data = await DashboardService.getSummary(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully.",
            reference: null,
            data,
            errors: null
        });

    });

    /**
     * Service Analytics
     */
    static getServiceAnalytics = asyncHandler(async (req, res) => {

        const data =
            await DashboardService.getServiceAnalytics(
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Service analytics retrieved successfully.",
            reference: null,
            data,
            errors: null
        });

    });

    /**
     * Monthly Analytics
     */
    static getMonthlyAnalytics = asyncHandler(async (req, res) => {

        const data =
            await DashboardService.getMonthlyAnalytics(
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Monthly analytics retrieved successfully.",
            reference: null,
            data,
            errors: null
        });

    });

    /**
     * Recent Transactions
     */
    static getRecentTransactions = asyncHandler(async (req, res) => {

        const data =
            await DashboardService.getRecentTransactions(
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Recent transactions retrieved successfully.",
            reference: null,
            data,
            errors: null
        });

    });

}

module.exports = DashboardController;