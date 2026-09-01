const DataPlansService = require("../services/dataPlansService");
const ApiResponse = require("../helpers/apiResponse");

const getPlans = async (req, res) => {

    try {

        const { network } = req.params;
const { provider } = req.query;

const plans = await DataPlansService.getPlans(
    network,
    provider
);

        return ApiResponse.success(
            res,
            "Data plans retrieved successfully.",
            plans
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            "Unable to retrieve data plans.",
            500
        );

    }

};

module.exports = {
    getPlans,
};