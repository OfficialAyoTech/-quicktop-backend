const TransactionCheckerService = require("../services/transactionCheckerService");

function startTransactionWorker() {

    console.log("🚀 Transaction Worker Started");

    setInterval(async () => {

        try {

            await TransactionCheckerService.checkPendingTransactions();

        } catch (error) {

            console.error("Transaction Worker Error:", error);

        }

    }, 20000); // every 20 seconds

}

module.exports = startTransactionWorker;