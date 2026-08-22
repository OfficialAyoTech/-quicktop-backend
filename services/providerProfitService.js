const pool = require("../config/database");

class ProviderProfitService {

    /**
     * Records ClubKonnect gross profit for a confirmed-successful transaction.
     * Must only be called from the SUCCESS branch of TransactionStatusService.check() —
     * never from the purchase functions themselves, since those only know
     * the transaction is pending. Never throws — a ledger-write failure
     * must not break the customer-facing success flow; it's logged loudly instead.
     */
        static async recordProfit(transaction) {

        try {

            let providerCost;

            if (transaction.service === "AIRTIME") {

                const commissionResult = await pool.query(
                    `SELECT commission_percent FROM network_commissions
                     WHERE service = 'AIRTIME' AND network = $1`,
                    [transaction.network.toUpperCase()]
                );

                const commissionRow = commissionResult.rows[0];

                if (!commissionRow) {
                    console.error(`No commission rate for AIRTIME/${transaction.network} — profit not recorded for ${transaction.reference}`);
                    return;
                }

                const rate = Number(commissionRow.commission_percent);
                providerCost = Number((Number(transaction.amount) * (1 - rate / 100)).toFixed(2));

            } else if (transaction.service === "DATA" || transaction.service === "CABLE_TV") {

                if (transaction.margin === null || transaction.margin === undefined) {
                    // Known gap: rewards-funded / promotional purchases don't
                    // carry margin. See provider_cost discussion — until that
                    // lands, these are logged as zero-profit rows rather than
                    // silently skipped, so at least the transaction is visible
                    // in the ledger for manual review.
                    providerCost = Number(transaction.amount);
                } else {
                    providerCost = Number(transaction.amount) - Number(transaction.margin);
                }

            } else if (transaction.service === "ELECTRICITY") {

                const commissionResult = await pool.query(
                    `SELECT commission_percent FROM network_commissions
                     WHERE service = 'ELECTRICITY' AND network = $1`,
                    [transaction.network.toUpperCase()]
                );

                const commissionRow = commissionResult.rows[0];

                if (!commissionRow) {
                    console.error(`No commission rate for ELECTRICITY/${transaction.network} — profit not recorded for ${transaction.reference}`);
                    return;
                }

                const rate = Number(commissionRow.commission_percent);
                providerCost = Number((Number(transaction.amount) * (1 - rate / 100)).toFixed(2));

            } else {
                return;
            }

            const grossProfit = Number((Number(transaction.amount) - providerCost).toFixed(2));

            await pool.query(
                `INSERT INTO provider_profit_ledger
                 (transaction_reference, service, network, customer_amount, provider_cost, gross_profit)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (transaction_reference) DO NOTHING`,
                [
                    transaction.reference,
                    transaction.service,
                    transaction.network || null,
                    transaction.amount,
                    providerCost,
                    grossProfit
                ]
            );

        } catch (error) {
            console.error("PROVIDER PROFIT LEDGER WRITE FAILED:", transaction.reference, error);
        }

    }

}

module.exports = ProviderProfitService;