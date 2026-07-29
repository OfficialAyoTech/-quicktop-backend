const asyncHandler = require("../helpers/asyncHandler");
const ApiResponse = require("../helpers/apiResponse");

const PinService = require("../services/pinService");

const {
    createPinSchema,
    verifyPinSchema,
    changePinSchema
} = require("../validators/pinValidator");

class PinController {

    /**
     * Create PIN
     */
    static createPin = asyncHandler(async (req, res) => {

        const { error } =
            createPinSchema.validate(req.body);

        if (error) {
            return ApiResponse.badRequest(
                res,
                error.details[0].message
            );
        }

        const result =
            await PinService.createPin(
                req.user.id,
                req.body.pin
            );

        return ApiResponse.success(
            res,
            result.message,
            null
        );

    });

    /**
     * Verify PIN
     */
    static verifyPin = asyncHandler(async (req, res) => {

        const { error } =
            verifyPinSchema.validate(req.body);

        if (error) {
            return ApiResponse.badRequest(
                res,
                error.details[0].message
            );
        }

        await PinService.verifyPin(
            req.user.id,
            req.body.pin
        );

        return ApiResponse.success(
            res,
            "PIN verified successfully.",
            null
        );

    });

    /**
     * Change PIN
     */
    static changePin = asyncHandler(async (req, res) => {

        const { error } =
            changePinSchema.validate(req.body);

        if (error) {
            return ApiResponse.badRequest(
                res,
                error.details[0].message
            );
        }

        const result =
            await PinService.changePin(
                req.user.id,
                req.body.oldPin,
                req.body.newPin
            );

        return ApiResponse.success(
            res,
            result.message,
            null
        );

    });

    /**
     * PIN Status
     */
    static getStatus = asyncHandler(async (req, res) => {

        const status =
            await PinService.getStatus(
                req.user.id
            );

        return ApiResponse.success(
            res,
            "PIN status retrieved successfully.",
            status
        );

    });

}

module.exports = PinController;