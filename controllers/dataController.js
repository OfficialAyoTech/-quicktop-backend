const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");

const buyData = async (req, res) => {

    try {
        console.log("===== DATA REQUEST =====");
console.log(req.body);
console.log(req.user);

        const { network, phone, plan, amount } = req.body;

        if (!network || !phone || !plan) {
            return ApiResponse.error(
                res,
                "Please provide network, phone number and data plan."
            );
        }

        console.log("Calling TransactionService.purchaseData...");
        const result = await TransactionService.purchaseData(
    req.user.id,
    {
        network,
        phone,
        plan,
        amount
    }
);

        let message = "Data purchase successful.";

        if (!result.success) {

    return ApiResponse.error(
    res,
    result.message || "Unable to complete your data purchase. Please try again later.",
    400,
    null,
    result.reference
);

}

        return ApiResponse.success(
    res,
    message,
    {
        ...result.response,
        wallet: result.wallet
    },
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