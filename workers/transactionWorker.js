const TransactionCheckerService = require("../services/transactionCheckerService");

function startTransactionWorker() {

    console.log("🚀 Transaction Worker Started");

    setInterval(async () => {

        try {

            await TransactionCheckerService.checkPendingTransactions();

        } catch (error) {

            console.error("Transaction Worker Error:", error);

        }

    }, 300000);  // every 5 minutes, instead of 20 seconds

}

module.exports = startTransactionWorker;