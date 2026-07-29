const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");

const verifyMeter = async (req, res) => {

    try {

        const {
            electricCompany,
            meterType,
            meterNo
        } = req.body;

console.log("VERIFY REQUEST BODY");
console.log(req.body);

        const result = await TransactionService.verifyMeter({
            electricCompany,
            meterType,
            meterNo
        });

        return ApiResponse.success(
            res,
            "Meter verified successfully.",
            result
        );

    } catch (error) {

    console.error("VERIFY METER ERROR");
    console.error(error);
    console.error(error.response?.data);

    return res.status(400).json({
        success: false,
        message: error.response?.data || error.message
    });

}

};

const purchaseElectricity = async (req, res) => {

    try {

        const {
            electricCompany,
            meterType,
            meterNo,
            amount,
            phone
        } = req.body;

        const result =
            await TransactionService.purchaseElectricity(
                req.user.id,
                {
                    electricCompany,
                    meterType,
                    meterNo,
                    amount,
                    phone
                }
            );

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.message,
            reference: result.reference,
            data: result.response
        });

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            "Unable to complete electricity purchase.",
            500
        );

    }

};

module.exports = {
    verifyMeter,
    purchaseElectricity
};