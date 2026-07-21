const TransactionModel = require("../models/transactionModel");
const {
    buyAirtime,
    buyData,
    getWalletBalance,
    queryTransaction
} = require("./clubKonnectService");
const WalletService = require("./walletService");
const ProviderResponse = require("../helpers/providerResponse");
const generateReference = require("../utils/referenceGenerator");
const NETWORKS = require("../utils/networkCodes");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const DatabaseTransaction = require("../helpers/databaseTransaction");

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
        throw new BadRequestError("Invalid network.");
    }

    const reference = generateReference();

    let walletDebited = false;

    await DatabaseTransaction.run(async (client) => {

    const updatedWallet = await WalletService.debitWithClient(
        userId,
        {
            amount,
            source: "WALLET",
            service: "AIRTIME",
            reference,
            description: `Airtime purchase for ${phone}`
        },
        client
    );

    walletDebited = true;

    await TransactionModel.create(
        {
            user_id: userId,
            reference,
            provider: "ClubKonnect",
            service: "Airtime",
            phone,
            amount,
            status: "PENDING",
            network,
            balance_after: updatedWallet.balance,
            api_response: {}
        },
        client
    );

});

    try {

    
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

            if (transactionStatus === "FAILED") {

                await WalletService.credit(userId, {
                    amount,
                    source: "REFUND",
                    service: "AIRTIME",
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed airtime purchase"
                });

            }

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

            if (walletDebited) {

                await WalletService.credit(userId, {
                    amount,
                    source: "REFUND",
                    service: "AIRTIME",
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed airtime purchase"
                });

            }

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
        amount
    } = payload;

    const networkCode = NETWORKS[network.toUpperCase()];

    if (!networkCode) {
        throw new BadRequestError("Invalid network.");
    }

    const reference = generateReference();

    return await DatabaseTransaction.run(async (client) => {

        // Debit wallet
        const updatedWallet = await WalletService.debitWithClient(
            userId,
            {
                amount,
                source: "WALLET",
                service: "DATA",
                reference,
                description: `Data purchase for ${phone}`
            },
            client
        );

        // Save pending transaction
        await TransactionModel.create(
            {
                user_id: userId,
                reference,
                provider: "ClubKonnect",
                service: "Data",
                phone,
                amount,
                status: "PENDING",
                network,
                balance_after: updatedWallet.balance,
                api_response: {}
            },
            client
        );

        try {

            const response = await buyData({
                network: networkCode,
                plan,
                phone,
                requestId: reference
            });

            // Wait 3 seconds before querying
await new Promise(resolve => setTimeout(resolve, 3000));

const queryResponse = await queryTransaction({
    requestId: reference
});

console.log("========== FINAL QUERY ==========");
console.log(queryResponse);

            const transactionStatus =
    response.status === "ORDER_RECEIVED" ||
    response.statuscode === "100"
        ? "SUCCESS"
        : "FAILED";

            if (transactionStatus === "FAILED") {

                await WalletService.creditWithClient(
                    userId,
                    {
                        amount,
                        source: "REFUND",
                        service: "DATA",
                        reference: `${reference}-REFUND`,
                        description: "Refund for failed data purchase"
                    },
                    client
                );

            }

            await TransactionModel.updateStatus(
                reference,
                transactionStatus,
                response,
                client
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

            await WalletService.creditWithClient(
                userId,
                {
                    amount,
                    source: "REFUND",
                    service: "DATA",
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed data purchase"
                },
                client
            );

            await TransactionModel.updateStatus(
                reference,
                "FAILED",
                {
                    error: error.response?.data || error.message
                },
                client
            );

            throw error;

        }

    });

}
    /**
 * Record Wallet Funding Transaction
 */
static async recordWalletFunding(
    userId,
    payload,
    client = null
) {

    return await TransactionModel.create(
        {
            user_id: userId,
            reference: payload.reference,
            provider: "Paystack",
            service: "Wallet Funding",
            phone: null,
            amount: payload.amount,
            status: "SUCCESS",
            balance_after: payload.balance_after,
            api_response: payload.api_response || {}
        },
        client
    );

}
        /**
     * Get all transactions
     */
    static async getTransactions(userId, query = {}) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const offset = (page - 1) * limit;

        return await TransactionModel.getTransactions(userId, {
            service: query.service,
            status: query.status,
            limit,
            offset
        });

    }

    /**
     * Get transaction by reference
     */
    static async getTransaction(userId, reference) {

        const transaction =
            await TransactionModel.findByReference(reference);

        if (!transaction) {
            throw new NotFoundError("Transaction not found.");
        }

        if (String(transaction.user_id) !== String(userId)) {
   throw new ForbiddenError(
       "Unauthorized access to transaction."
   );
}

        return transaction;

    }

}

module.exports = TransactionService;