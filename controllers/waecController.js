const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");
const asyncHandler = require("../helpers/asyncHandler");
const pool = require("../config/database");

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

exports.getWaecPrice = asyncHandler(async (req, res) => {

    const result = await pool.query(
        `SELECT name, sell_price
         FROM waec_packages
         WHERE is_active = true
         ORDER BY id
         LIMIT 1`
    );

    const row = result.rows[0];

    if (!row) {
        return ApiResponse.error(
            res,
            "WAEC Result Checker PIN is currently unavailable.",
            404
        );
    }

    return ApiResponse.success(
        res,
        "WAEC price retrieved successfully.",
        {
            name: row.name,
            sell_price: row.sell_price
        }
    );

});