const ApiResponse = require("../helpers/apiResponse");

const errorHandler = (err, req, res, next) => {

    console.error("====================================");
    console.error("GLOBAL ERROR");
    console.error(err);
    console.error("====================================");

    const statusCode = err.statusCode || 500;

    return ApiResponse.error(
        res,
        err.message || "Internal Server Error",
        statusCode,
        process.env.NODE_ENV === "development"
            ? err.stack
            : null
    );

};

module.exports = errorHandler;