const TransactionService = require("../services/transactionService");
const asyncHandler = require("../helpers/asyncHandler");

class TransactionController {

    /**
     * Get all transactions
     */
    static getTransactions = asyncHandler(async (req, res) => {

        const userId = req.user.uid;

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
     * Get a single transaction
     */
    static getTransaction = asyncHandler(async (req, res) => {

        const userId = req.user.uid;

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

}

module.exports = TransactionController;