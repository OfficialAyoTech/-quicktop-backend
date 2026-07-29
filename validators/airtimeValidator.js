const ApiResponse = require("../helpers/apiResponse");

const validateAirtimeRequest = (req, res, next) => {

    const {
        network,
        phone,
        amount,
        pin
    } = req.body;

    // Required fields
    if (!network || !phone || !amount || !pin) {
        return ApiResponse.error(
            res,
            "Network, phone, amount and transaction PIN are required.",
            400
        );
    }

    // Validate phone number
    const phoneRegex = /^0\d{10}$/;

    if (!phoneRegex.test(phone)) {
        return ApiResponse.error(
            res,
            "Invalid phone number.",
            400
        );
    }

    // Validate amount
    const airtimeAmount = Number(amount);

    if (isNaN(airtimeAmount) || airtimeAmount <= 0) {
        return ApiResponse.error(
            res,
            "Amount must be greater than zero.",
            400
        );
    }

    // Validate PIN
    const pinRegex = /^\d{4}$/;

    if (!pinRegex.test(pin)) {
        return ApiResponse.error(
            res,
            "Transaction PIN must be exactly 4 digits.",
            400
        );
    }

    next();
};

module.exports = validateAirtimeRequest;