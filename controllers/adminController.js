const AdminService = require("../services/adminService");
const ApiResponse = require("../helpers/apiResponse");

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
                req.params.id
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
                req.body.reason
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
                req.params.id
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
                req.params.id
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

module.exports = {
    getDashboard,
    getAllKyc,
    getKycById,
    approveKyc,
    rejectKyc,
    getUsers,
    getUserById,
    suspendUser,
    activateUser
};