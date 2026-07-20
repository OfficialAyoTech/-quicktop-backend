const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");

const buyData = async (req, res) => {

    try {

        const { network, phone, plan } = req.body;

        if (!network || !phone || !plan) {
            return ApiResponse.error(
                res,
                "Please provide network, phone number and data plan."
            );
        }

        const result = await TransactionService.purchaseData(
            req.user.id,
            {
                network,
                phone,
                plan
            }
        );

        let message = "Data purchase successful.";

        if (!result.success) {

    return ApiResponse.error(
        res,
        "Unable to complete your data purchase. Please try again later.",
        400,
        null,
        result.reference
    );

}

        return ApiResponse.success(
            res,
            message,
            result.response,
            result.reference
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            "Something went wrong. Please try again later.",
            500
        );

    }

};

module.exports = {
    buyData
};