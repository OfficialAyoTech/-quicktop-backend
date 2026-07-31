const ReferralService = require("../services/referralService");
const ApiResponse = require("../helpers/apiResponse");

const getReferralDashboard = async (req, res) => {

    try {

        const result =
            await ReferralService.getReferralDashboard(
                req.user.id
            );

        return ApiResponse.success(
            res,
            "Referral dashboard retrieved successfully.",
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

module.exports = {
    getReferralDashboard
};