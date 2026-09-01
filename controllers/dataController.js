const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");

exports.buyData = asyncHandler(async (req, res) => {

    const {
        network,
        phone,
        plan,
        amount,
        pin,
        payment_source
    } = req.body;

    const result = await TransactionService.purchaseData(
        req.user.id,
        {
            network,
            phone,
            plan,
            amount,
            pin,
            payment_source
        }
    );

    return ApiResponse.success(
        res,
        result.message,
        {
            ...result.response,
            wallet: result.wallet
        },
        result.reference
    );

});