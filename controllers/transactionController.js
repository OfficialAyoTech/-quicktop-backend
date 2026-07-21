const TransactionService = require("../services/transactionService");
const asyncHandler = require("../helpers/asyncHandler");
const ApiResponse = require("../helpers/apiResponse");

class TransactionController {

    /**
     * Get all transactions
     */
    static getTransactions = asyncHandler(async (req, res) => {

        const userId = req.user.id;

        const transactions =
            await TransactionService.getTransactions(
                userId,
                req.query
            );

        res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully.",
            reference: null,
            data: transactions,
            errors: null
        });

    });

    /**
     * Get single transaction from database
     */
    static getTransaction = asyncHandler(async (req, res) => {

        const userId = req.user.id;

        const transaction =
            await TransactionService.getTransaction(
                userId,
                req.params.reference
            );

        res.status(200).json({
            success: true,
            message: "Transaction retrieved successfully.",
            reference: null,
            data: transaction,
            errors: null
        });

    });

    /**
     * Query transaction from ClubKonnect
     */
    static queryTransaction = asyncHandler(async (req, res) => {

        const { reference } = req.params;

        const result =
            await TransactionService.queryTransaction(reference);

        return ApiResponse.success(
            res,
            "Transaction queried successfully.",
            result
        );

    });

}

module.exports = TransactionController;