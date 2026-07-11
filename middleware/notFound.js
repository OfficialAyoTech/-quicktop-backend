const ApiResponse = require("../helpers/apiResponse");

const notFound = (req, res) => {

    return ApiResponse.error(
        res,
        `Route ${req.originalUrl} not found`,
        404
    );

};

module.exports = notFound;