const TransactionService = require("../services/transactionService");

const purchaseAirtime = async (req, res) => {
    try {

        const { network, phone, amount } = req.body;

        // Validate request
        if (!network || !phone || !amount) {
            return res.status(400).json({
                success: false,
                message: "Please enter your network, phone number and airtime amount."
            });
        }

        // Purchase airtime
        const result = await TransactionService.purchaseAirtime(
            req.user.uid,
            {
                network,
                phone,
                amount
            }
        );

        let message = "Airtime purchase successful.";

        if (!result.success) {

    return ApiResponse.error(
        res,
        "Unable to complete your airtime purchase. Please try again later.",
        400,
        null,
        result.reference
    );

}

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message,
            reference: result.reference,
            data: result.response
        });

    } catch (error) {

        console.error("AIRTIME PURCHASE ERROR");
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "We're unable to process your request right now. Please try again later.",
            error: error.response?.data || error.message
        });

    }
};

module.exports = {
    purchaseAirtime
};