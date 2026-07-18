const ApiResponse = require("../helpers/apiResponse");
const AppError = require("../helpers/AppError");

const errorHandler = (err, req, res, next) => {

    console.error(err);

    // Our custom application errors
    if (err instanceof AppError) {

        return ApiResponse.error(
            res,
            err.message,
            err.statusCode
        );

    }

    // Joi validation errors
    if (err.isJoi) {

        return ApiResponse.error(
            res,
            err.details[0].message,
            400
        );

    }

    // PostgreSQL errors
    if (err.code) {

        switch (err.code) {

            case "23505":
                return ApiResponse.error(
                    res,
                    "Duplicate record already exists.",
                    409
                );

            case "23503":
                return ApiResponse.error(
                    res,
                    "Referenced record does not exist.",
                    400
                );

            case "23502":
                return ApiResponse.error(
                    res,
                    "A required field is missing.",
                    400
                );

            default:
                break;
        }

    }

    // Unknown errors
    return ApiResponse.error(
        res,
        process.env.NODE_ENV === "production"
            ? "Internal server error."
            : err.message,
        500
    );

};

module.exports = errorHandler;