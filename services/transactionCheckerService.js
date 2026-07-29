const TransactionModel = require("../models/transactionModel");
const TransactionStatusService = require("./transactionStatusService");

class TransactionCheckerService {

    static async checkPendingTransactions() {

        console.log("========== CHECKING PENDING TRANSACTIONS ==========");

        const transactions =
            await TransactionModel.getPendingTransactions();

        console.log(`Found ${transactions.length} pending transaction(s)`);

        for (const transaction of transactions) {

            console.log("--------------------------------");
            console.log(`Checking: ${transaction.reference}`);

            try {

                await TransactionStatusService.check(
                    transaction.reference,
                    transaction.user_id,
                    transaction.amount
                );

                console.log(`✅ ${transaction.reference} checked successfully`);

            } catch (error) {

                console.error(
                    `❌ Failed checking ${transaction.reference}`,
                    error.message
                );

            }

        }

    }

}

module.exports = TransactionCheckerService;