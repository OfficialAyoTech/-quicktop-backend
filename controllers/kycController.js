const KycService = require("../services/kycService");
const ApiResponse = require("../helpers/apiResponse");

/**
 * Submit or Update KYC
 */
exports.submitKyc = async (req, res) => {

    try {

        const result =
            await KycService.submit(
                req.user.id,
                req.body,
                req.files
            );

        return ApiResponse.success(
            res,
            "KYC submitted successfully.",
            result
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

/**
 * Get User KYC
 */
exports.getKyc = async (req, res) => {

    try {

        const result =
            await KycService.get(
                req.user.id
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
            400
        );

    }

};