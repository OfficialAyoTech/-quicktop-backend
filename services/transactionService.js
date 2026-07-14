const TransactionModel = require("../models/transactionModel");
const {
    buyAirtime,
    buyData,
} = require("./clubkonnectService");
const ProviderResponse = require("../helpers/providerResponse");
const generateReference = require("../utils/referenceGenerator");
const NETWORKS = require("../utils/networkCodes");

class TransactionService {

    /**
     * Purchase Airtime
     */
    static async purchaseAirtime(userId, payload) {

        const {
            network,
            phone,
            amount
        } = payload;

        const networkCode = NETWORKS[network.toUpperCase()];

        if (!networkCode) {
            throw new Error("Invalid network.");
        }

        // Generate unique reference
        const reference = generateReference();

        // Create transaction
        await TransactionModel.create({
            user_id: userId,
            reference,
            provider: "ClubKonnect",
            service: "Airtime",
            phone,
            amount,
            status: "PENDING",
            api_response: {}
        });

        try {

            // Call ClubKonnect
            const response = await buyAirtime({
                network: networkCode,
                amount,
                phone,
                requestId: reference
            });

            const transactionStatus =
                response.statuscode === "100"
                    ? "SUCCESS"
                    : "FAILED";

            await TransactionModel.updateStatus(
                reference,
                transactionStatus,
                response
            );

           return {
    success: transactionStatus === "SUCCESS",
    reference,
    response: ProviderResponse.airtime(
        {
            network,
            phone,
            amount
        },
        response,
        reference
    )
};

        } catch (error) {

            await TransactionModel.updateStatus(
                reference,
                "FAILED",
                {
                    error: error.response?.data || error.message
                }
            );

            throw error;

        }

    }
/**
 * Purchase Data
 */
static async purchaseData(userId, payload) {

    const {
        network,
        phone,
        plan,
    } = payload;

    const networkCode = NETWORKS[network.toUpperCase()];

    if (!networkCode) {
        throw new Error("Invalid network.");
    }

    // Generate unique reference
    const reference = generateReference();

    // Save pending transaction
    await TransactionModel.create({
        user_id: userId,
        reference,
        provider: "ClubKonnect",
        service: "Data",
        phone,
        amount: 0,
        status: "PENDING",
        api_response: {}
    });

    try {

        // Call ClubKonnect
        const response = await buyData({
            network: networkCode,
            plan,
            phone,
            requestId: reference
        });

        const transactionStatus =
            response.statuscode === "100"
                ? "SUCCESS"
                : "FAILED";

        await TransactionModel.updateStatus(
            reference,
            transactionStatus,
            response
        );

        return {
    success: transactionStatus === "SUCCESS",
    reference,
    response: ProviderResponse.data(
        {
            network,
            phone,
            plan
        },
        response,
        reference
    )
};

    } catch (error) {

        await TransactionModel.updateStatus(
            reference,
            "FAILED",
            {
                error: error.response?.data || error.message
            }
        );

        throw error;

    }

}
}

module.exports = TransactionService;