const TransactionService = require("../services/transactionService");
const ApiResponse = require("../helpers/apiResponse");

const verifyCable = async (req, res) => {

    try {

        const {
            cableTv,
            smartCardNo
        } = req.body;

        const result =
            await TransactionService.verifyCable({
                cableTv,
                smartCardNo
            });

        return ApiResponse.success(
            res,
            "Cable account verified successfully.",
            result
        );

    } catch (error) {

        console.error(error);

        return ApiResponse.error(
            res,
            error.message,
            400
        );

    }

};

const purchaseCable = async (req, res) => {

    try {

        const {
    cableTv,
    package,
    smartCardNo,
    amount,
    phone,
    pin
} = req.body;

const result =
    await TransactionService.purchaseCable(
        req.user.id,
        {
            cableTv,
            package,
            smartCardNo,
            amount,
            phone,
            pin
        }
    );

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.message,
            reference: result.reference,
            data: result.response
        });

    } catch (error) {

    console.log("========== CABLE PURCHASE ERROR ==========");
    console.log(error);

    if (error.response) {
        console.log(error.response.data);
    }

    return res.status(500).json({
        success: false,
        message: error.response?.data || error.message
    });

}

};

module.exports = {
    verifyCable,
    purchaseCable
};