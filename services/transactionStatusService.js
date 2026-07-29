const TransactionModel = require("../models/transactionModel");
const WalletService = require("./walletService");
const NotificationService = require("./notificationService");
const notificationTemplates = require("../utils/notificationTemplates");

const {
    queryTransaction
} = require("./clubkonnectService");

class TransactionStatusService {

    /**
     * Check transaction status from provider
     */
    static async check(reference, userId, amount) {

        console.log("========== CHECKING TRANSACTION ==========");
        console.log(reference);

        const queryResponse = await queryTransaction({
            requestId: reference
        });

        console.log("========== QUERY RESPONSE ==========");
        console.log(queryResponse);

        let transactionStatus = "PENDING";

        if (
            queryResponse.statuscode === "200" ||
            queryResponse.status === "ORDER_COMPLETED"
        ) {

            transactionStatus = "SUCCESS";

        } else if (
            queryResponse.status === "ORDER_RECEIVED"
        ) {

            transactionStatus = "PENDING";

        } else {

            transactionStatus = "FAILED";

        }

        console.log("========== TRANSACTION STATUS ==========");
        console.log(transactionStatus);

        const transaction =
            await TransactionModel.findByReference(reference);

        await TransactionModel.updateStatus(
            reference,
            transactionStatus,
            queryResponse
        );

        console.log("========== DATABASE UPDATED ==========");

        // SUCCESS
        if (transactionStatus === "SUCCESS") {

            const notification =
                this.getNotification(
                    transaction,
                    "SUCCESS"
                );

            await NotificationService.notify({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                type: "SUCCESS",
                metadata: {
                    reference,
                    amount,
                    service: transaction.service
                }
            });

        }

        // FAILED
        if (transactionStatus === "FAILED") {

            console.log("========== REFUNDING WALLET ==========");

            await WalletService.credit(
                userId,
                {
                    amount,
                    source: "REFUND",
                    service: transaction.service,
                    reference: `${reference}-REFUND`,
                    description: "Refund for failed transaction"
                }
            );

            console.log("========== REFUND COMPLETED ==========");

            const notification =
                this.getNotification(
                    transaction,
                    "FAILED"
                );

            await NotificationService.notify({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                type: "FAILED",
                metadata: {
                    reference,
                    amount,
                    service: transaction.service
                }
            });

        }

        return transactionStatus;

    }

    /**
     * Build notification from template
     */
    static getNotification(transaction, status) {

        const template =
            notificationTemplates[
                transaction.service
            ]?.[status];

        if (!template) {

            return {
                title: `Transaction ${status}`,
                message: `Your transaction has been ${status.toLowerCase()}.`
            };

        }

        return template({
            amount: transaction.amount,
            phone: transaction.phone,
            reference: transaction.reference,
            network: transaction.network
        });

    }

}

module.exports = TransactionStatusService;