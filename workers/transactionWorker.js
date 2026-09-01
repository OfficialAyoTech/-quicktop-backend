const TransactionCheckerService = require("../services/transactionCheckerService");

function startTransactionWorker() {

    console.log("🚀 Transaction Worker Started");

    setInterval(async () => {

        try {

            await TransactionCheckerService.checkPendingTransactions();

        } catch (error) {

            console.error("Transaction Worker Error:", error);

        }

    }, 1200000); // 20 minutes

}

module.exports = startTransactionWorker;