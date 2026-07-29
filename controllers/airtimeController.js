const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

exports.purchaseAirtime = asyncHandler(async (req, res) => {

    const {
        network,
        phone,
        amount,
        pin
    } = req.body;

    const result = await TransactionService.purchaseAirtime(
        req.user.id,
        {
            network,
            phone,
            amount,
            pin
        }
    );

    return ApiResponse.success(
        res,
        result.message,
        result.response,
        result.reference
    );

});