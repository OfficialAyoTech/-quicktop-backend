const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

exports.purchaseWaec = asyncHandler(async (req, res) => {

    const {
        phone,
        pin
    } = req.body;

    const result = await TransactionService.purchaseWaec(
        req.user.id,
        {
            phone,
            pin
        }
    );

    return ApiResponse.success(
        res,
        result.message,
        result
    );

});