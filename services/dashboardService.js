const WalletService = require("./walletService");
const TransactionModel = require("../models/transactionModel");
const DashboardModel = require("../models/dashboardModel");

class DashboardService {

    /**
     * Dashboard Overview
     */
    static async getDashboard(userId) {

        const wallet =
            await WalletService.getBalance(userId);

        const recentTransactions =
            await TransactionModel.getTransactions(
                userId,
                {
                    limit: 5,
                    offset: 0
                }
            );

        return {
            wallet,
            recentTransactions
        };

    }

    /**
     * Dashboard Summary
     */
    static async getSummary(userId) {

        const summary =
            await DashboardModel.getSummary(userId);

        return {
            wallet_balance: Number(summary.wallet_balance || 0),
            total_spent: Number(summary.total_spent || 0),
            total_funded: Number(summary.total_funded || 0),
            total_transactions: Number(summary.total_transactions || 0)
        };

    }

    /**
     * Service Analytics
     */
    static async getServiceAnalytics(userId) {

        const analytics =
            await DashboardModel.getServiceAnalytics(userId);

        return analytics.map(item => ({
            service: item.service,
            total_transactions: Number(item.total_transactions),
            total_amount: Number(item.total_amount)
        }));

    }

    /**
     * Monthly Analytics
     */
    static async getMonthlyAnalytics(userId) {

        const analytics =
            await DashboardModel.getMonthlyAnalytics(userId);

        return analytics.map(item => ({

            month: new Date(item.month).toLocaleString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            ),

            total: Number(item.total)

        }));

    }

    /**
     * Recent Transactions
     */
    static async getRecentTransactions(userId) {

        return await DashboardModel.getRecentTransactions(
            userId
        );

    }

}

module.exports = DashboardService;