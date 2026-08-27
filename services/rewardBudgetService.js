const pool = require("../config/database");
const generateReference = require("../utils/referenceGenerator");

class RewardBudgetService {

    /**
     * Returns the current state of the Marketing/Rewards Reserve.
     * available = allocated - spent. Never negative by construction —
     * deduct() below refuses to let spent exceed allocated.
     */
    static async getBudget() {
        const result = await pool.query(
            `SELECT allocated_amount, spent_amount, updated_at FROM reward_budget LIMIT 1`
        );

        const row = result.rows[0];
        if (!row) {
            throw new Error("reward_budget row missing — has the migration been run?");
        }

        const allocated = Number(row.allocated_amount);
        const spent = Number(row.spent_amount);

        return {
            allocated_amount: allocated,
            spent_amount: spent,
            available_amount: Number((allocated - spent).toFixed(2)),
            updated_at: row.updated_at
        };
    }

    /**
     * Admin manually adds money to the reserve (Option 4 in the spec:
     * manual allocation). Increases allocated_amount, which increases
     * available_amount by the same. Logged in reward_budget_ledger as ALLOCATION.
     */
    static async allocate(amount, description, adminId) {
        if (!amount || Number(amount) <= 0) {
            throw new Error("Allocation amount must be greater than 0");
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const before = await client.query(
                `SELECT allocated_amount, spent_amount FROM reward_budget LIMIT 1 FOR UPDATE`
            );
            const beforeRow = before.rows[0];
            const availableBefore = Number(beforeRow.allocated_amount) - Number(beforeRow.spent_amount);

            const updateResult = await client.query(
                `UPDATE reward_budget
                 SET allocated_amount = allocated_amount + $1, updated_at = now()
                 RETURNING allocated_amount, spent_amount`,
                [amount]
            );

            const after = updateResult.rows[0];
            const availableAfter = Number(after.allocated_amount) - Number(after.spent_amount);

            await client.query(
                `INSERT INTO reward_budget_ledger
                 (type, amount, balance_before, balance_after, reference, description, created_by)
                 VALUES ('ALLOCATION', $1, $2, $3, $4, $5, $6)`,
                [
                    amount,
                    availableBefore,
                    availableAfter,
                    generateReference("RWDALLOC"),
                    description || "Manual reward budget allocation",
                    adminId || null
                ]
            );

            await client.query("COMMIT");

            return {
                allocated_amount: Number(after.allocated_amount),
                spent_amount: Number(after.spent_amount),
                available_amount: Number(availableAfter.toFixed(2))
            };

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Deducts a reward claim from the reserve. This is what the future
     * coupon-claim flow will call before crediting a user. Atomic and
     * self-guarding: the WHERE clause only allows the update to succeed
     * if enough is actually available, so a negative balance is
     * structurally impossible — no separate "check then spend" race.
     *
     * Returns null if insufficient budget (caller should treat this as
     * "reward currently unavailable"), never throws for that case.
     */
    static async deduct(amount, transactionReference, description) {
        if (!amount || Number(amount) <= 0) {
            throw new Error("Deduction amount must be greater than 0");
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const before = await client.query(
                `SELECT allocated_amount, spent_amount FROM reward_budget LIMIT 1 FOR UPDATE`
            );
            const beforeRow = before.rows[0];
            const availableBefore = Number(beforeRow.allocated_amount) - Number(beforeRow.spent_amount);

            const updateResult = await client.query(
                `UPDATE reward_budget
                 SET spent_amount = spent_amount + $1, updated_at = now()
                 WHERE (allocated_amount - spent_amount) >= $1
                 RETURNING allocated_amount, spent_amount`,
                [amount]
            );

            if (updateResult.rowCount === 0) {
                // Not enough available — refuse cleanly, no partial state.
                await client.query("ROLLBACK");
                return null;
            }

            const after = updateResult.rows[0];
            const availableAfter = Number(after.allocated_amount) - Number(after.spent_amount);

            await client.query(
                `INSERT INTO reward_budget_ledger
                 (type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                 VALUES ('SPEND', $1, $2, $3, $4, $5, $6, NULL)`,
                [
                    amount,
                    availableBefore,
                    availableAfter,
                    generateReference("RWDSPEND"),
                    transactionReference || null,
                    description || "Reward claim"
                ]
            );

            await client.query("COMMIT");

            return {
                allocated_amount: Number(after.allocated_amount),
                spent_amount: Number(after.spent_amount),
                available_amount: Number(availableAfter.toFixed(2))
            };

                } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Same as deduct(), but runs inside a transaction the caller already
     * owns (no BEGIN/COMMIT/ROLLBACK of its own, no pool.connect()) — used
     * by the coupon claim flow so budget deduction, wallet credit, and
     * ledger write all succeed or fail together as one atomic operation.
     * Still uses the same WHERE-guarded UPDATE, so a negative balance is
     * still structurally impossible even inside a shared transaction.
     */
    static async deductWithClient(amount, transactionReference, description, client) {

        if (!amount || Number(amount) <= 0) {
            throw new Error("Deduction amount must be greater than 0");
        }

        const before = await client.query(
            `SELECT allocated_amount, spent_amount FROM reward_budget LIMIT 1 FOR UPDATE`
        );
        const beforeRow = before.rows[0];
        const availableBefore = Number(beforeRow.allocated_amount) - Number(beforeRow.spent_amount);

        const updateResult = await client.query(
            `UPDATE reward_budget
             SET spent_amount = spent_amount + $1, updated_at = now()
             WHERE (allocated_amount - spent_amount) >= $1
             RETURNING allocated_amount, spent_amount`,
            [amount]
        );

        if (updateResult.rowCount === 0) {
            // Not enough available — caller's transaction handles the rollback.
            return null;
        }

        const after = updateResult.rows[0];
        const availableAfter = Number(after.allocated_amount) - Number(after.spent_amount);

        await client.query(
            `INSERT INTO reward_budget_ledger
             (type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
             VALUES ('SPEND', $1, $2, $3, $4, $5, $6, NULL)`,
            [
                amount,
                availableBefore,
                availableAfter,
                generateReference("RWDSPEND"),
                transactionReference || null,
                description || "Reward claim"
            ]
        );

        return {
            allocated_amount: Number(after.allocated_amount),
            spent_amount: Number(after.spent_amount),
            available_amount: Number(availableAfter.toFixed(2))
        };

    }

    /**
     * Reverses a previous SPEND (e.g. a claim that was later voided).
     * Symmetric to deduct() — reduces spent_amount, frees up available_amount.
     */
    static async reverse(amount, transactionReference, description) {
        if (!amount || Number(amount) <= 0) {
            throw new Error("Reversal amount must be greater than 0");
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const before = await client.query(
                `SELECT allocated_amount, spent_amount FROM reward_budget LIMIT 1 FOR UPDATE`
            );
            const beforeRow = before.rows[0];
            const availableBefore = Number(beforeRow.allocated_amount) - Number(beforeRow.spent_amount);

            const updateResult = await client.query(
                `UPDATE reward_budget
                 SET spent_amount = GREATEST(spent_amount - $1, 0), updated_at = now()
                 RETURNING allocated_amount, spent_amount`,
                [amount]
            );

            const after = updateResult.rows[0];
            const availableAfter = Number(after.allocated_amount) - Number(after.spent_amount);

            await client.query(
                `INSERT INTO reward_budget_ledger
                 (type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                 VALUES ('REVERSAL', $1, $2, $3, $4, $5, $6, NULL)`,
                [
                    amount,
                    availableBefore,
                    availableAfter,
                    generateReference("RWDREV"),
                    transactionReference || null,
                    description || "Reward claim reversal"
                ]
            );

            await client.query("COMMIT");

            return {
                allocated_amount: Number(after.allocated_amount),
                spent_amount: Number(after.spent_amount),
                available_amount: Number(availableAfter.toFixed(2))
            };

        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

}

module.exports = RewardBudgetService;