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

            // Wallet-funding transactions are credits, not debits — this
            // function's logic (add the amount back to the wallet) would
            // double-credit the customer instead of undoing the funding.
            // Use reverseWalletFunding() for those instead.
            if (transaction.service === "WALLET_FUNDING") {
                throw new Error(
                    "Wallet funding transactions cannot be reversed here — use the settlement refund action instead."
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

            // --- Reverse cashback, if this transaction had any ---
            await client.query(
                `UPDATE cashback_transactions
                 SET status = 'REVERSED'
                 WHERE source_reference = $1 AND status = 'ACTIVE'`,
                [transaction.reference]
            );

            // --- Reverse referral bonus, if this transaction triggered one ---
            await client.query(
                `UPDATE referrals
                 SET status = 'REVERSED'
                 WHERE transaction_reference = $1 AND status = 'COMPLETED'`,
                [transaction.reference]
            );

            // The transaction's own provider field tells us which capital
            // account to credit back — was hardcoded to CLUBKONNECT before,
            // which silently misattributed reversals for any other provider
            // (e.g. WAEC/VTPASS) to the wrong balance.
            const capitalProvider = transaction.provider === "VTpass" ? "VTPASS" : "CLUBKONNECT";

            const capitalResult = await client.query(
                `UPDATE provider_accounts
                 SET balance = balance + $1, updated_at = now()
                 WHERE provider = $2
                 RETURNING balance`,
                [providerCost, capitalProvider]
            );

                if (capitalResult.rows.length === 0) {
                    throw new Error(`provider_accounts row for ${capitalProvider} not found during reversal`);
                }

                const capBalanceAfter = Number(capitalResult.rows[0].balance);
                const capBalanceBefore = capBalanceAfter - Number(providerCost);

                await client.query(
                    `INSERT INTO provider_capital_ledger
                     (provider, type, amount, balance_before, balance_after, reference, transaction_reference, description, created_by)
                     VALUES ($1, 'REVERSAL', $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        capitalProvider,
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
     * Preview a reconciliation — read-only comparison of the internally
     * tracked (expected) balance against the real ClubKonnect dashboard
     * balance the admin just checked. Writes nothing. The admin reviews
     * this and only then calls reconcileProviderCapital() to actually
     * apply the correction.
     */
    static async previewReconciliation(provider, actualBalance) {

        if (actualBalance === undefined || actualBalance === null) {
            throw new Error("actualBalance is required.");
        }

        const accountResult = await pool.query(
            `SELECT balance FROM provider_accounts WHERE provider = $1`,
            [provider]
        );

        if (accountResult.rows.length === 0) {
            throw new Error(`Provider account not found: ${provider}`);
        }

        const expected = Number(accountResult.rows[0].balance);
        const actual = Number(actualBalance);
        const difference = Number((actual - expected).toFixed(2));

        return {
            provider,
            expected_balance: expected,
            actual_balance: actual,
            difference,
            status: difference === 0 ? "RECONCILED" : "REQUIRES_INVESTIGATION"
        };

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
            `SELECT COALESCE(SUM(gross_profit), 0) AS total FROM provider_profit_ledger WHERE status = 'ACTIVE'`
        );

                const cashbackResult = await pool.query(
            `SELECT COALESCE(SUM(cashback_amount), 0) AS total FROM cashback_transactions
             WHERE status = 'ACTIVE'`
        );

        const referralResult = await pool.query(
            `SELECT COALESCE(SUM(reward), 0) AS total FROM referrals
             WHERE status = 'COMPLETED'`
        );

        const expensesResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM business_expenses`
        );

        const withdrawnResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM profit_withdrawals
             WHERE status IN ('PENDING', 'COMPLETED')`
        );

        // Money allocated to the Reward/Marketing Budget is earmarked for
        // coupon giveaways the moment it's allocated — even before anyone
        // claims it — so it must be reserved out of withdrawable profit the
        // same way a PENDING withdrawal already is above. Without this, the
        // same profit naira could be both allocated to rewards AND withdrawn
        // as cash, leaving claims backed by nothing.
        const rewardBudgetResult = await pool.query(
            `SELECT COALESCE(allocated_amount, 0) AS total FROM reward_budget LIMIT 1`
        );

        const grossProfit = Number(grossProfitResult.rows[0].total);
        const cashback = Number(cashbackResult.rows[0].total);
        const referrals = Number(referralResult.rows[0].total);
        const expenses = Number(expensesResult.rows[0].total);
        const alreadyReservedOrWithdrawn = Number(withdrawnResult.rows[0].total);
        const rewardBudgetAllocated = Number(rewardBudgetResult.rows[0]?.total || 0);

        const withdrawable = Number((
            grossProfit - cashback - referrals - expenses - alreadyReservedOrWithdrawn - rewardBudgetAllocated
        ).toFixed(2));

        return {
            gross_profit: grossProfit,
            cashback_paid: cashback,
            referral_bonuses_paid: referrals,
            business_expenses: expenses,
            already_withdrawn_or_pending: alreadyReservedOrWithdrawn,
            reward_budget_allocated: rewardBudgetAllocated,
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

    }

        /**
     * Resolves a range keyword (or custom bounds) into { startDate, endDate }.
     * endDate === null means "open-ended, up to now" — used for the
     * original today/week/month/all ranges. Bounded ranges (yesterday,
     * last_week, last_month, custom) get both ends so they don't leak
     * into the present.
     */
    static getRangeStartDate(range, fromDate, toDate) {

        const now = new Date();

        if (range === "today") {

            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { startDate: start, endDate: null };

        }

        if (range === "yesterday") {

            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return { startDate: start, endDate: end };

        }

        if (range === "week") {

            // Trailing 7 days, open-ended (existing behavior, unchanged)
            const start = new Date(now);
            start.setDate(start.getDate() - 7);
            return { startDate: start, endDate: null };

        }

        if (range === "last_week") {

            // Previous complete calendar week, Monday–Sunday
            const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
            const daysSinceMonday = (dayOfWeek + 6) % 7;
            const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(lastMonday.getDate() - 7);
            return { startDate: lastMonday, endDate: thisMonday };

        }

        if (range === "month") {

            // Calendar-month-to-date (existing behavior, unchanged)
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: start, endDate: null };

        }

        if (range === "last_month") {

            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: start, endDate: end };

        }

        if (range === "custom") {

            if (!fromDate || !toDate) {
                throw new Error("Custom range requires both from_date and to_date.");
            }

            const start = new Date(fromDate);
            // Include the entire to_date day, not just midnight of it
            const end = new Date(toDate);
            end.setDate(end.getDate() + 1);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error("Invalid from_date or to_date.");
            }

            return { startDate: start, endDate: end };

        }

        // "all" or unrecognized — no filtering
        return { startDate: null, endDate: null };

    }
    
    /**
     * Financial Overview dashboard data, optionally filtered to a date
     * range. Provider capital balance is always current — it's a running
     * total, not something that makes sense to filter by date.
     */
           static async getFinancialOverview(range = "all", fromDate, toDate) {

        const { startDate, endDate } = this.getRangeStartDate(range, fromDate, toDate);

                const dateParam = [];
        let dateClause = "";
        let expenseDateClause = "";
        let profitClause = "WHERE status = 'ACTIVE'";

        if (startDate && endDate) {
            dateParam.push(startDate, endDate);
            dateClause = "WHERE created_at >= $1 AND created_at < $2";
            expenseDateClause = "WHERE expense_date >= $1 AND expense_date < $2";
            profitClause += " AND created_at >= $1 AND created_at < $2";
        } else if (startDate) {
            dateParam.push(startDate);
            dateClause = "WHERE created_at >= $1";
            expenseDateClause = "WHERE expense_date >= $1";
            profitClause += " AND created_at >= $1";
        }

        // Profit by service
        const profitByServiceResult = await pool.query(
            `SELECT service, COALESCE(SUM(gross_profit), 0) AS total
             FROM provider_profit_ledger
             ${profitClause}
             GROUP BY service`,
            dateParam
        );

        const grossProfitResult = await pool.query(
            `SELECT COALESCE(SUM(gross_profit), 0) AS total
             FROM provider_profit_ledger ${profitClause}`,
            dateParam
        );

                const cashbackDateCondition =
            startDate && endDate ? "AND created_at >= $1 AND created_at < $2" :
            startDate ? "AND created_at >= $1" : "";

        const cashbackResult = await pool.query(
            `SELECT COALESCE(SUM(cashback_amount), 0) AS total
             FROM cashback_transactions
             WHERE status = 'ACTIVE' ${cashbackDateCondition}`,
            dateParam
        );

        const referralDateCondition =
            startDate && endDate ? "AND created_at >= $1 AND created_at < $2" :
            startDate ? "AND created_at >= $1" : "";

        const referralResult = await pool.query(
            `SELECT COALESCE(SUM(reward), 0) AS total FROM referrals
             WHERE status = 'COMPLETED'
             ${referralDateCondition}`,
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

                const withdrawalsDateCondition =
            startDate && endDate ? "WHERE requested_at >= $1 AND requested_at < $2" :
            startDate ? "WHERE requested_at >= $1" : "";

        const withdrawalsResult = await pool.query(
            `SELECT
                COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) AS total_completed,
                COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS total_pending,
                COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count
             FROM profit_withdrawals
             ${withdrawalsDateCondition}`,
            dateParam
        );

                const capitalResult = await pool.query(
            `SELECT balance FROM provider_accounts WHERE provider = 'CLUBKONNECT'`
        );

        const walletLiabilityResult = await pool.query(
            `SELECT COALESCE(SUM(balance), 0) AS total FROM wallets`
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

            customer_wallet_liability: Number(walletLiabilityResult.rows[0].total),

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

        /**
     * Reverse a wallet-funding transaction — used when a Paystack payment
     * is refunded or charged back. Unlike reverseTransaction() (which is
     * for purchases and credits the wallet), this DEBITS the wallet since
     * funding was itself a credit. Allowed to push the balance negative:
     * if the customer already spent the money, that becomes a debt owed,
     * not a reason to block a real external refund/chargeback from
     * being reflected.
     */
    static async reverseWalletFunding(reference, admin) {

        const client = await pool.connect();

        try {

            await client.query("BEGIN");

            const transaction = await TransactionModel.getByReference(reference, client);

            if (!transaction) {
                throw new Error("Transaction not found.");
            }

            if (transaction.service !== "WALLET_FUNDING") {
                throw new Error("This is not a wallet funding transaction — use the standard reverse action instead.");
            }

            if (transaction.status !== "successful") {
                throw new Error("Only successful funding transactions can be reversed.");
            }

            const wallet = await WalletModel.findByUserId(transaction.user_id, client);

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            const lockedWallet = await WalletModel.lockWallet(wallet.id, client);

            const balanceBefore = Number(lockedWallet.balance);
            const balanceAfter = balanceBefore - Number(transaction.amount);

            await WalletModel.updateBalance(wallet.id, balanceAfter, client);

            const reversalReference = generateReference("FNDREV");

            await WalletLedgerModel.create({
                wallet_id: wallet.id,
                type: "debit",
                source: "ADMIN",
                service: "FUNDING_REVERSAL",
                amount: transaction.amount,
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                reference: reversalReference,
                description: `Funding reversal of ${transaction.reference}`,
                status: "successful"
            }, client);

            await TransactionModel.create({
                user_id: transaction.user_id,
                reference: reversalReference,
                provider: "ADMIN",
                service: "FUNDING_REVERSAL",
                amount: transaction.amount,
                status: "successful",
                transaction_type: "REVERSAL",
                narration: `Funding reversal of ${transaction.reference}`,
                balance_after: balanceAfter,
                api_response: { reversed_reference: transaction.reference }
            }, client);

            await TransactionModel.changeStatus(transaction.reference, "reversed", client);

            const ledgerResult = await client.query(
                `UPDATE paystack_fee_ledger
                 SET refund_status = 'REFUNDED', refunded_at = now(), refund_reference = $1
                 WHERE transaction_reference = $2 AND refund_status = 'NONE'
                 RETURNING id`,
                [reversalReference, transaction.reference]
            );

            if (ledgerResult.rowCount === 0) {
                throw new Error("No matching Paystack fee ledger row found to mark as refunded (or it was already refunded).");
            }

            await AdminActionModel.log({
                admin_id: admin.id,
                admin_email: admin.email,
                action: "WALLET_FUNDING_REVERSE",
                target_type: "transaction",
                target_id: transaction.reference,
                details: {
                    user_id: transaction.user_id,
                    amount: transaction.amount,
                    reversal_reference: reversalReference,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter
                }
            }, client);

            await NotificationService.notify({
                user_id: transaction.user_id,
                title: "⚠️ Wallet Funding Reversed",
                message: `A payment of ₦${transaction.amount} was reversed and has been deducted from your wallet.`,
                type: "FAILED",
                category: "wallet"
            });

            await client.query("COMMIT");

            return {
                message: "Wallet funding reversed successfully.",
                reversal_reference: reversalReference,
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
     * Sync settlements from Paystack — pulls the latest settlement
     * payouts and upserts them into paystack_settlements. Safe to run
     * repeatedly (manual button, not a background job) since it's
     * keyed on Paystack's own settlement_id — re-running never
     * duplicates a row, only refreshes its status/amount if changed.
     */
    static async syncSettlements(admin) {

        const PaystackService = require("./paystackService");

        const response = await PaystackService.listSettlements(50, 1);

        const settlements = response.data || [];

        let inserted = 0;
        let updated = 0;

        for (const s of settlements) {

            const result = await pool.query(
                `INSERT INTO paystack_settlements
                 (settlement_id, status, currency, total_amount, settlement_date, synced_at)
                 VALUES ($1, $2, $3, $4, $5, now())
                 ON CONFLICT (settlement_id) DO UPDATE
                 SET status = EXCLUDED.status,
                     total_amount = EXCLUDED.total_amount,
                     settlement_date = EXCLUDED.settlement_date,
                     synced_at = now()
                 RETURNING (xmax = 0) AS inserted`,
                [
                    s.id,
                    s.status,
                    s.currency || "NGN",
                    Number(s.total_amount) / 100,
                    s.settlement_date || null
                ]
            );

            if (result.rows[0].inserted) {
                inserted++;
            } else {
                updated++;
            }

        }

        await AdminActionModel.log({
            admin_id: admin.id,
            admin_email: admin.email,
            action: "SETTLEMENTS_SYNC",
            target_type: "paystack_settlements",
            target_id: "sync",
            details: { inserted, updated, total_fetched: settlements.length }
        });

        return {
            message: `Settlement sync complete: ${inserted} new, ${updated} updated.`,
            inserted,
            updated,
            total_fetched: settlements.length
        };

    }

    /**
     * Get stored settlements (paginated), most recent first.
     */
    static async getSettlements(query) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM paystack_settlements
             ORDER BY settlement_date DESC NULLS LAST
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM paystack_settlements`
        );

        return {
            settlements: result.rows,
            total: Number(countResult.rows[0].count),
            page,
            limit
        };

    }

}

module.exports = AdminService;