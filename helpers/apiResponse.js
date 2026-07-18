class ApiResponse {

    /**
     * Success Response
     */
    static success(
        res,
        message,
        data = null,
        reference = null,
        status = 200
    ) {

        return res.status(status).json({
            success: true,
            message,
            reference,
            data,
            errors: null
        });

    }

    /**
     * Generic Error
     */
    static error(
        res,
        message,
        status = 400,
        errors = null,
        reference = null
    ) {

        return res.status(status).json({
            success: false,
            message,
            reference,
            data: null,
            errors
        });

    }

    /**
     * 400 Bad Request
     */
    static badRequest(res, message, errors = null) {

        return this.error(
            res,
            message,
            400,
            errors
        );

    }

    /**
     * 401 Unauthorized
     */
    static unauthorized(res, message = "Unauthorized") {

        return this.error(
            res,
            message,
            401
        );

    }

    /**
     * 403 Forbidden
     */
    static forbidden(res, message = "Forbidden") {

        return this.error(
            res,
            message,
            403
        );

    }

    /**
     * 404 Not Found
     */
    static notFound(res, message = "Resource not found") {

        return this.error(
            res,
            message,
            404
        );

    }

    /**
     * 409 Conflict
     */
    static conflict(res, message) {

        return this.error(
            res,
            message,
            409
        );

    }

    /**
     * 500 Internal Server Error
     */
    static serverError(
        res,
        message = "Internal server error"
    ) {

        return this.error(
            res,
            message,
            500
        );

    }

}

module.exports = ApiResponse;