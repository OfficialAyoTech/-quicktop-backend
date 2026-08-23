const AdminModel = require("../models/adminModel");
const KycModel = require("../models/kycModel");
const UserModel = require("../models/userModel");
const NotificationService = require("./notificationService");
const AdminActionModel = require("../models/adminActionModel");

const pool = require("../config/database");
const WalletModel = require("../models/walletModel");
const WalletLedgerModel = require("../models/walletLedgerModel");
const TransactionModel = require("../models/transactionModel");
const generateReference = require("../utils/referenceGenerator");

class AdminService {

    /**
     * Get Admin Dashboard
     */
    static async getDashboard() {

        const stats = await AdminModel.getDashboard();

        return {
            total_users: Number(stats.total_users),
            active_users: Number(stats.active_users),
            pending_kyc: Number(stats.pending_kyc),
            verified_kyc: Number(stats.verified_kyc),
            total_wallet_balance: Number(stats.total_wallet_balance),
            total_transactions: Number(stats.total_transactions),
            today_transactions: Number(stats.today_transactions)
        };

    }

    /**
     * Get all KYC submissions
     */
    static async getAllKyc() {

        return await KycModel.findAll();

    }

    /**
     * Get single KYC
     */
    static async getKycById(id) {

        return await KycModel.findById(id);

    }

    /**
     * Approve KYC
     */
    static async approveKyc(id, admin) {

        const kyc = await KycModel.findById(id);

        if (!kyc) {
            throw new Error("KYC record not found.");
        }

        if (kyc.verification_status === "VERIFIED") {
            throw new Error("KYC has already been approved.");
        }

        if (kyc.verification_status === "REJECTED") {
            throw new Error("Rejected KYC cannot be approved.");
        }

        await KycModel.approve(id);

        await UserModel.updateVerificationStatus(
            kyc.user_id,
            true
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "KYC_APPROVE",
            target_type: "kyc",
            target_id: id,
            details: { user_id: kyc.user_id }
        });

        await NotificationService.notify({
            user_id: kyc.user_id,
            title: "✅ KYC Approved",
            message: "Your identity verification has been approved. You now have full access to QuickTop.",
            type: "SUCCESS",
            category: "kyc"
        });

        return {
            message: "KYC approved successfully."
        };

    }

    /**
     * Reject KYC
     */
    static async rejectKyc(id, reason, admin) {

        const kyc = await KycModel.findById(id);

        if (!kyc) {
            throw new Error("KYC record not found.");
        }

        if (kyc.verification_status === "REJECTED") {
            throw new Error("KYC has already been rejected.");
        }

        if (kyc.verification_status === "VERIFIED") {
            throw new Error("Verified KYC cannot be rejected.");
        }

        await KycModel.reject(id, reason);

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "KYC_REJECT",
            target_type: "kyc",
            target_id: id,
            details: { user_id: kyc.user_id, reason }
        });

        await NotificationService.notify({
            user_id: kyc.user_id,
            title: "❌ KYC Rejected",
            message: reason,
            type: "FAILED",
            category: "kyc"
        });

        return {
            message: "KYC rejected successfully."
        };

    }

    /**
     * Get users with pagination, search and filters
     */
    static async getUsers(query) {

        const options = {
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
            search: query.search || "",
            role: query.role,
            status: query.status,
            verified:
                query.verified === undefined
                    ? undefined
                    : query.verified === "true"
        };

        return await AdminModel.getUsers(options);

    }

    /**
     * Get all wallets
     */
    static async getWallets() {

        return await AdminModel.getWallets();

    }

    /**
     * Get single wallet
     */
    static async getWalletByUserId(userId) {

        const wallet = await AdminModel.getWalletByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        return wallet;

    }

    /**
     * Get single user
     */
    static async getUserById(id) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;

    }

    /**
     * Suspend user
     */
    static async suspendUser(id, admin) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        if (user.role === "ADMIN") {
            throw new Error("Admin account cannot be suspended.");
        }

        if (user.account_status === "SUSPENDED") {
            throw new Error("User is already suspended.");
        }

        await AdminModel.updateUserStatus(
            id,
            "SUSPENDED"
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "USER_SUSPEND",
            target_type: "user",
            target_id: id
        });

        await NotificationService.notify({
            user_id: id,
            title: "🚫 Account Suspended",
            message: "Your QuickTop account has been suspended. Please contact support.",
            type: "FAILED",
            category: "account"
        });

        return {
            message: "User suspended successfully."
        };

    }

    /**
     * Activate user
     */
    static async activateUser(id, admin) {

        const user = await AdminModel.getUserById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        if (user.account_status === "ACTIVE") {
            throw new Error("User is already active.");
        }

        await AdminModel.updateUserStatus(
            id,
            "ACTIVE"
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "USER_ACTIVATE",
            target_type: "user",
            target_id: id
        });

        await NotificationService.notify({
            user_id: id,
            title: "🎉 Account Activated",
            message: "Your QuickTop account has been reactivated.",
            type: "SUCCESS",
            category: "account"
        });

        return {
            message: "User activated successfully."
        };

    }

    /**
     * Credit User Wallet (Admin)
     */
    static async creditWallet(
        userId,
        amount,
        narration = "Admin Wallet Credit",
        admin
    ) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const wallet = await WalletModel.findByUserId(
                userId,
                client
            );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            const balanceAfter =
                balanceBefore + Number(amount);

            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reference =
                generateReference("ADMINCR");

            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "credit",

                source: "ADMIN",

                service: "ADMIN_CREDIT",

                amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference,

                description: narration,

                status: "successful"

            }, client);

            await TransactionModel.create({

                user_id: userId,

                reference,

                provider: "ADMIN",

                service: "ADMIN_CREDIT",

                amount,

                status: "successful",

                transaction_type: "ADMIN",

                narration,

                balance_after: balanceAfter,

                api_response: {
                    source: "ADMIN"
                }

            }, client);

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "WALLET_CREDIT",
                target_type: "user",
                target_id: userId,
                details: {
                    amount,
                    narration,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            await NotificationService.notify({

                user_id: userId,

                title: "💰 Wallet Credited",

                message: `₦${amount} has been credited to your wallet by the administrator.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {
                message: "Wallet credited successfully.",
                reference,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

    /**
     * Debit User Wallet (Admin)
     */
    static async debitWallet(
        userId,
        amount,
        narration = "Admin Wallet Debit",
        admin
    ) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            // Find wallet
            const wallet = await WalletModel.findByUserId(
                userId,
                client
            );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            // Lock wallet
            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            // Prevent overdraft
            if (balanceBefore < Number(amount)) {
                throw new Error("Insufficient wallet balance.");
            }

            const balanceAfter =
                balanceBefore - Number(amount);

            // Update wallet
            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reference =
                generateReference("ADMINDB");

            // Wallet Ledger
            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "debit",

                source: "ADMIN",

                service: "ADMIN_DEBIT",

                amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference,

                description: narration,

                status: "successful"

            }, client);

            // Transaction
            await TransactionModel.create({

                user_id: userId,

                reference,

                provider: "ADMIN",

                service: "ADMIN_DEBIT",

                amount,

                status: "successful",

                transaction_type: "ADMIN",

                narration,

                balance_after: balanceAfter,

                api_response: {
                    source: "ADMIN"
                }

            }, client);

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "WALLET_DEBIT",
                target_type: "user",
                target_id: userId,
                details: {
                    amount,
                    narration,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            // Notification
            await NotificationService.notify({

                user_id: userId,

                title: "💸 Wallet Debited",

                message: `₦${amount} has been deducted from your wallet by the administrator.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {
                message: "Wallet debited successfully.",
                reference,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

    /**
     * Get all transactions
     */
    static async getTransactions(query) {

        return await AdminModel.getTransactions({

            page: Number(query.page) || 1,

            limit: Number(query.limit) || 20,

            status: query.status,

            service: query.service,

            provider: query.provider,

            transaction_type: query.transaction_type,

            search: query.search

        });

    }

    /**
     * Get single transaction
     */
    static async getTransaction(reference) {

        const transaction =
            await AdminModel.getTransaction(reference);

        if (!transaction) {

            throw new Error("Transaction not found.");

        }

        return transaction;

    }

    /**
     * Reverse transaction
     */
    static async reverseTransaction(reference, admin) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            // Find original transaction
            const transaction =
                await TransactionModel.getByReference(
                    reference,
                    client
                );

            if (!transaction) {
                throw new Error("Transaction not found.");
            }

            if (transaction.status !== "successful") {
                throw new Error(
                    "Only successful transactions can be reversed."
                );
            }

            // Find user's wallet
            const wallet =
                await WalletModel.findByUserId(
                    transaction.user_id,
                    client
                );

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            // Lock wallet
            const lockedWallet =
                await WalletModel.lockWallet(
                    wallet.id,
                    client
                );

            const balanceBefore =
                Number(lockedWallet.balance);

            const balanceAfter =
                balanceBefore + Number(transaction.amount);

            // Credit wallet back
            await WalletModel.updateBalance(
                wallet.id,
                balanceAfter,
                client
            );

            const reversalReference =
                generateReference("REV");

            // Wallet Ledger
            await WalletLedgerModel.create({

                wallet_id: wallet.id,

                type: "credit",

                source: "ADMIN",

                service: "REVERSAL",

                amount: transaction.amount,

                balance_before: balanceBefore,

                balance_after: balanceAfter,

                reference: reversalReference,

                description: `Reversal of ${transaction.reference}`,

                status: "successful"

            }, client);

            // Reversal Transaction
            await TransactionModel.create({

                user_id: transaction.user_id,

                reference: reversalReference,

                provider: "ADMIN",

                service: "REVERSAL",

                amount: transaction.amount,

                status: "successful",

                transaction_type: "REVERSAL",

                narration:
                    `Reversal of ${transaction.reference}`,

                balance_after: balanceAfter,

                api_response: {
                    reversed_reference: transaction.reference
                }

            }, client);

            // Mark original transaction
            await TransactionModel.changeStatus(
                transaction.reference,
                "reversed",
                client
            );

            // --- Reverse provider profit + capital, if this transaction had one ---
            const profitReversalResult = await client.query(
                `UPDATE provider_profit_ledger
                 SET status = 'REVERSED'
                 WHERE transaction_reference = $1 AND status = 'ACTIVE'
                 RETURNING provider_cost, service`,
                [transaction.reference]
            );

            if (profitReversalResult.rowCount === 1) {

                const { provider_cost: providerCost } = profitReversalResult.rows[0];

                const capitalResult = await client.query(
                    `UPDATE provider_accounts
                     SET balance = balance + $1, updated_at = now()
                     WHERE provider = 'CLUBKONNECT'
                     RETURNING balance`,
                    [providerCost]
                );

                if (capitalResult.rows.length === 0) {
                    throw new Error("provider_accounts row for CLUBKONNECT not found during reversal");
                }

                const capBalanceAfter = Number(capitalResult.rows[0].balance);
                const capBalanceBefore = capBalanceAfter - Number(providerCost);

                await client.query(
                    `INSERT INTO provider_capital_ledger
                     (provider, type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                     VALUES ('CLUBKONNECT', 'REVERSAL', $1, $2, $3, $4, $5, $6, $7)`,
                    [
                        providerCost,
                        capBalanceBefore,
                        capBalanceAfter,
                        generateReference("CAPREV"),
                        transaction.reference,
                        `Capital reversal for ${transaction.reference}`,
                        admin.email
                    ]
                );

            }

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "TRANSACTION_REVERSE",
                target_type: "transaction",
                target_id: transaction.reference,
                details: {
                    user_id: transaction.user_id,
                    amount: transaction.amount,
                    reversal_reference: reversalReference
                }
            }, client);

            // Notify user
            await NotificationService.notify({

                user_id: transaction.user_id,

                title: "↩️ Transaction Reversed",

                message:
                    `₦${transaction.amount} has been refunded to your wallet.`,

                type: "SUCCESS",

                category: "wallet"

            });

            await client.query("COMMIT");

            return {

                message: "Transaction reversed successfully.",

                reversal_reference: reversalReference

            };

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();

        }

    }

        /**
     * Top up provider capital (Admin) — records a manual bank-transfer
     * top-up to a provider's wallet (e.g. ClubKonnect) in provider_accounts,
     * with a matching provider_capital_ledger row and admin audit log.
     */
    static async topupProviderCapital(
        provider,
        amount,
        narration = "Manual capital top-up",
        admin
    ) {

        if (!amount || Number(amount) <= 0) {
            throw new Error("A valid amount is required.");
        }

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const accountResult = await client.query(
                `SELECT balance FROM provider_accounts
                 WHERE provider = $1
                 FOR UPDATE`,
                [provider]
            );

            if (accountResult.rows.length === 0) {
                throw new Error(`Provider account not found: ${provider}`);
            }

            const balanceBefore = Number(accountResult.rows[0].balance);
            const balanceAfter = balanceBefore + Number(amount);

            await client.query(
                `UPDATE provider_accounts
                 SET balance = $1, updated_at = now()
                 WHERE provider = $2`,
                [balanceAfter, provider]
            );

            const reference = generateReference("CAPTOP");

            await client.query(
                `INSERT INTO provider_capital_ledger
                 (provider, type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                 VALUES ($1, 'TOPUP', $2, $3, $4, $5, NULL, $6, $7)`,
                [provider, amount, balanceBefore, balanceAfter, reference, narration, admin.email]
            );

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "PROVIDER_CAPITAL_TOPUP",
                target_type: "provider_account",
                target_id: provider,
                details: {
                    amount,
                    narration,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            await client.query("COMMIT");

            return {
                message: "Provider capital topped up successfully.",
                reference,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

    /**
     * Reconcile provider capital (Admin) — corrects provider_accounts.balance
     * to match the provider's real dashboard balance, recording the delta
     * as a RECONCILIATION_ADJUSTMENT ledger row so drift history is never lost.
     */
    static async reconcileProviderCapital(
        provider,
        actualBalance,
        reason,
        admin
    ) {

        if (actualBalance === undefined || actualBalance === null) {
            throw new Error("actualBalance is required.");
        }

        if (!reason || !reason.trim()) {
            throw new Error("A reason is required for a reconciliation adjustment.");
        }

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const accountResult = await client.query(
                `SELECT balance FROM provider_accounts
                 WHERE provider = $1
                 FOR UPDATE`,
                [provider]
            );

            if (accountResult.rows.length === 0) {
                throw new Error(`Provider account not found: ${provider}`);
            }

            const balanceBefore = Number(accountResult.rows[0].balance);
            const balanceAfter = Number(actualBalance);
            const delta = Number((balanceAfter - balanceBefore).toFixed(2));

            if (delta === 0) {
                await client.query("ROLLBACK");
                return {
                    message: "No adjustment needed — recorded balance already matches.",
                    balance: balanceBefore
                };
            }

            await client.query(
                `UPDATE provider_accounts
                 SET balance = $1, updated_at = now()
                 WHERE provider = $2`,
                [balanceAfter, provider]
            );

            const reference = generateReference("CAPADJ");

            await client.query(
                `INSERT INTO provider_capital_ledger
                 (provider, type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                 VALUES ($1, 'RECONCILIATION_ADJUSTMENT', $2, $3, $4, $5, NULL, $6, $7)`,
                [provider, delta, balanceBefore, balanceAfter, reference, reason, admin.email]
            );

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "PROVIDER_CAPITAL_RECONCILE",
                target_type: "provider_account",
                target_id: provider,
                details: {
                    delta,
                    reason,
                    reference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            await client.query("COMMIT");

            return {
                message: "Provider capital reconciled successfully.",
                reference,
                delta,
                balance_before: balanceBefore,
                balance_after: balanceAfter
            };

        } catch (error) {

            await client.query("ROLLBACK");
            throw error;

        } finally {

            client.release();

        }

    }

        /**
     * Log a business expense (Admin)
     */
    static async createExpense(
        category,
        amount,
        description,
        expenseDate,
        admin
    ) {

        if (!category || !category.trim()) {
            throw new Error("A category is required.");
        }

        if (!amount || Number(amount) <= 0) {
            throw new Error("A valid amount is required.");
        }

        if (!description || !description.trim()) {
            throw new Error("A description is required.");
        }

        const reference = generateReference("EXP");

        const result = await pool.query(
            `INSERT INTO business_expenses
             (category, amount, description, reference, expense_date, created_by)
             VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6)
             RETURNING *`,
            [category.trim(), amount, description.trim(), reference, expenseDate || null, admin.email]
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "EXPENSE_CREATE",
            target_type: "business_expense",
            target_id: reference,
            details: {
                category,
                amount,
                description,
                reference
            }
        });

        return {
            message: "Expense logged successfully.",
            expense: result.rows[0]
        };

    }

    /**
     * Get business expenses (Admin) — paginated, optionally filtered by category or date range
     */
    static async getExpenses(query) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const offset = (page - 1) * limit;

        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (query.category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(query.category);
        }

        if (query.from_date) {
            conditions.push(`expense_date >= $${paramIndex++}`);
            params.push(query.from_date);
        }

        if (query.to_date) {
            conditions.push(`expense_date <= $${paramIndex++}`);
            params.push(query.to_date);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await pool.query(
            `SELECT * FROM business_expenses
             ${whereClause}
             ORDER BY expense_date DESC, created_at DESC
             LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
            [...params, limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM business_expenses ${whereClause}`,
            params
        );

        return {
            expenses: result.rows,
            total: Number(countResult.rows[0].count),
            page,
            limit
        };

    }

        /**
     * Calculate withdrawable profit: gross profit earned across all
     * confirmed sales, minus cashback granted, referral bonuses paid,
     * business expenses, and profit already withdrawn or reserved by a
     * pending withdrawal request.
     */
    static async getWithdrawableProfit() {

        const grossProfitResult = await pool.query(
            `SELECT COALESCE(SUM(gross_profit), 0) AS total FROM provider_profit_ledger`
        );

        const cashbackResult = await pool.query(
            `SELECT COALESCE(SUM(cashback_amount), 0) AS total FROM cashback_transactions`
        );

        const referralResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM wallet_ledger
             WHERE source = 'REFERRAL' AND service = 'REFERRAL_BONUS'`
        );

        const expensesResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM business_expenses`
        );

        const withdrawnResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM profit_withdrawals
             WHERE status IN ('PENDING', 'COMPLETED')`
        );

        const grossProfit = Number(grossProfitResult.rows[0].total);
        const cashback = Number(cashbackResult.rows[0].total);
        const referrals = Number(referralResult.rows[0].total);
        const expenses = Number(expensesResult.rows[0].total);
        const alreadyReservedOrWithdrawn = Number(withdrawnResult.rows[0].total);

        const withdrawable = Number((
            grossProfit - cashback - referrals - expenses - alreadyReservedOrWithdrawn
        ).toFixed(2));

        return {
            gross_profit: grossProfit,
            cashback_paid: cashback,
            referral_bonuses_paid: referrals,
            business_expenses: expenses,
            already_withdrawn_or_pending: alreadyReservedOrWithdrawn,
            withdrawable_profit: withdrawable
        };

    }

    /**
     * Request a profit withdrawal (Admin). Records intent to withdraw —
     * does not move any real money. The admin marks it COMPLETED
     * separately, once the money has actually been moved out.
     */
    static async requestWithdrawal(amount, destination, notes, admin) {

        if (!amount || Number(amount) <= 0) {
            throw new Error("A valid amount is required.");
        }

        const { withdrawable_profit } = await this.getWithdrawableProfit();

        if (Number(amount) > withdrawable_profit) {
            throw new Error(
                `Requested amount (₦${amount}) exceeds withdrawable profit (₦${withdrawable_profit}).`
            );
        }

        const reference = generateReference("WD");

        const result = await pool.query(
            `INSERT INTO profit_withdrawals
             (amount, status, reference, destination, requested_by, notes)
             VALUES ($1, 'PENDING', $2, $3, $4, $5)
             RETURNING *`,
            [amount, reference, destination || null, admin.email, notes || null]
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "WITHDRAWAL_REQUEST",
            target_type: "profit_withdrawal",
            target_id: reference,
            details: { amount, destination, reference }
        });

        return {
            message: "Withdrawal request recorded.",
            withdrawal: result.rows[0]
        };

    }

    /**
     * Resolve a withdrawal (Admin) — mark it COMPLETED once the money has
     * actually been moved out, or REJECTED/CANCELLED to release the
     * reserved amount back into withdrawable profit.
     */
    static async resolveWithdrawal(reference, status, admin) {

        const validStatuses = ["COMPLETED", "REJECTED", "CANCELLED"];

        if (!validStatuses.includes(status)) {
            throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
        }

        const existing = await pool.query(
            `SELECT * FROM profit_withdrawals WHERE reference = $1`,
            [reference]
        );

        if (existing.rows.length === 0) {
            throw new Error("Withdrawal not found.");
        }

        if (existing.rows[0].status !== "PENDING") {
            throw new Error(
                `Withdrawal is already ${existing.rows[0].status} — cannot change it again.`
            );
        }

        const result = await pool.query(
            `UPDATE profit_withdrawals
             SET status = $1, approved_by = $2, resolved_at = now()
             WHERE reference = $3
             RETURNING *`,
            [status, admin.email, reference]
        );

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "WITHDRAWAL_RESOLVE",
            target_type: "profit_withdrawal",
            target_id: reference,
            details: { status, reference }
        });

        return {
            message: `Withdrawal marked ${status.toLowerCase()}.`,
            withdrawal: result.rows[0]
        };

    }    /**
     * Financial Overview dashboard data, optionally filtered to a date
     * range. Provider capital balance is always current — it's a running
     * total, not something that makes sense to filter by date.
     */
    static async getFinancialOverview(range = "all") {

        const startDate = this.getRangeStartDate(range);
        const dateParam = startDate ? [startDate] : [];
        const dateClause = startDate ? "WHERE created_at >= $1" : "";
        const expenseDateClause = startDate ? "WHERE expense_date >= $1" : "";

        // Profit by service
        const profitByServiceResult = await pool.query(
            `SELECT service, COALESCE(SUM(gross_profit), 0) AS total
             FROM provider_profit_ledger
             ${dateClause}
             GROUP BY service`,
            dateParam
        );

        const grossProfitResult = await pool.query(
            `SELECT COALESCE(SUM(gross_profit), 0) AS total
             FROM provider_profit_ledger ${dateClause}`,
            dateParam
        );

        const cashbackResult = await pool.query(
            `SELECT COALESCE(SUM(cashback_amount), 0) AS total
             FROM cashback_transactions ${dateClause}`,
            dateParam
        );

        const referralResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM wallet_ledger
             WHERE source = 'REFERRAL' AND service = 'REFERRAL_BONUS'
             ${startDate ? "AND created_at >= $1" : ""}`,
            dateParam
        );

        const expensesResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM business_expenses ${expenseDateClause}`,
            dateParam
        );

        const paystackResult = await pool.query(
            `SELECT
                COALESCE(SUM(requested_amount), 0) AS total_funded,
                COALESCE(SUM(paystack_fee), 0) AS total_fees,
                COUNT(*) AS funding_count
             FROM paystack_fee_ledger ${dateClause}`,
            dateParam
        );

        const withdrawalsResult = await pool.query(
            `SELECT
                COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) AS total_completed,
                COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS total_pending,
                COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count
             FROM profit_withdrawals
             ${startDate ? "WHERE requested_at >= $1" : ""}`,
            dateParam
        );

        const capitalResult = await pool.query(
            `SELECT balance FROM provider_accounts WHERE provider = 'CLUBKONNECT'`
        );

        const grossProfit = Number(grossProfitResult.rows[0].total);
        const cashback = Number(cashbackResult.rows[0].total);
        const referrals = Number(referralResult.rows[0].total);
        const expenses = Number(expensesResult.rows[0].total);

        const netProfit = Number((grossProfit - cashback - referrals - expenses).toFixed(2));

        // Withdrawable profit is always all-time by definition — it's
        // "what's safe to take out right now," not scoped to a range.
        const { withdrawable_profit } = await this.getWithdrawableProfit();

        return {

            range,

            provider_capital: {
                clubkonnect_balance: Number(capitalResult.rows[0]?.balance || 0)
            },

            profit: {
                gross_profit: grossProfit,
                by_service: profitByServiceResult.rows.map(row => ({
                    service: row.service,
                    gross_profit: Number(row.total)
                })),
                cashback_paid: cashback,
                referral_bonuses_paid: referrals,
                business_expenses: expenses,
                net_profit: netProfit
            },

            withdrawable_profit,

            paystack: {
                total_funded: Number(paystackResult.rows[0].total_funded),
                total_fees_charged: Number(paystackResult.rows[0].total_fees),
                funding_count: Number(paystackResult.rows[0].funding_count)
            },

            withdrawals: {
                total_completed: Number(withdrawalsResult.rows[0].total_completed),
                total_pending: Number(withdrawalsResult.rows[0].total_pending),
                pending_count: Number(withdrawalsResult.rows[0].pending_count)
            }

        };

    }

}

module.exports = AdminService;