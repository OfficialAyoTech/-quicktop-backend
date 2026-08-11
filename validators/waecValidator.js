const ApiResponse = require("../helpers/apiResponse");

const validateWaecRequest = (req, res, next) => {

    const {
        phone,
        pin
    } = req.body;

    if (!phone || !pin) {
        return ApiResponse.error(
            res,
            "Phone number and transaction PIN are required.",
            400
        );
    }

    const phoneRegex = /^0\d{10}$/;

    if (!phoneRegex.test(phone)) {
        return ApiResponse.error(
            res,
            "Invalid phone number.",
            400
        );
    }

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

module.exports = validateWaecRequest;