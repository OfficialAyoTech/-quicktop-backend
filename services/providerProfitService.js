const pool = require("../config/database");
const generateReference = require("../utils/referenceGenerator");

class ProviderProfitService {

    /**
     * Records ClubKonnect gross profit for a confirmed-successful transaction,
     * and — for CLUBKONNECT-provider services only — deducts the provider cost
     * from provider_accounts capital tracking in the same DB transaction, so
     * profit and capital records can never drift apart.
     *
     * Must only be called from the SUCCESS branch of TransactionStatusService.check() —
     * never from the purchase functions themselves, since those only know
     * the transaction is pending. Never throws — a ledger-write failure
     * must not break the customer-facing success flow; it's logged loudly instead.
     */
    static async recordProfit(transaction) {

        let providerCost;

        try {

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

            const client = await pool.connect();

            try {

                await client.query("BEGIN");

                const insertResult = await client.query(
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

                // rowCount === 0 means this reference was already recorded
                // (a retry of an already-processed check()) — skip the
                // capital deduction so we never double-deduct for one
                // real purchase. rowCount === 1 means this is genuinely new.
                if (insertResult.rowCount === 1) {

                    const capitalResult = await client.query(
                        `UPDATE provider_accounts
                         SET balance = balance - $1, updated_at = now()
                         WHERE provider = 'CLUBKONNECT'
                         RETURNING balance`,
                        [providerCost]
                    );

                    if (capitalResult.rows.length === 0) {
                        // Should never happen (CLUBKONNECT row is seeded by migration),
                        // but if it does, don't silently lose the deduction —
                        // roll back and let the outer catch log it loudly.
                        throw new Error("provider_accounts row for CLUBKONNECT not found");
                    }

                    const balanceAfter = Number(capitalResult.rows[0].balance);
                    const balanceBefore = balanceAfter + providerCost;

                    await client.query(
                        `INSERT INTO provider_capital_ledger
                         (provider, type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                         VALUES ('CLUBKONNECT', 'DEDUCTION', $1, $2, $3, $4, $5, $6, NULL)`,
                        [
                            providerCost,
                            balanceBefore,
                            balanceAfter,
                            generateReference("CAPDED"),
                            transaction.reference,
                            `Capital deduction for ${transaction.service} — ${transaction.reference}`
                        ]
                    );

                }

                await client.query("COMMIT");

            } catch (error) {

                await client.query("ROLLBACK");
                throw error;

            } finally {

                client.release();

            }

        } catch (error) {
            console.error("PROVIDER PROFIT/CAPITAL LEDGER WRITE FAILED:", transaction.reference, error);
        }

    }

}

module.exports = ProviderProfitService;