class ApiResponse {

    static success(res, message, data = null, reference = null, status = 200) {

        return res.status(status).json({
            success: true,
            message,
            reference,
            data,
            errors: null
        });

    }

    static error(res, message, status = 400, errors = null, reference = null) {

        return res.status(status).json({
            success: false,
            message,
            reference,
            data: null,
            errors
        });

    }

}

module.exports = ApiResponse;