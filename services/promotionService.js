const pool = require("../config/database");

class PromotionService {

    static async create(payload, adminEmail) {

        const {
            name, description, reward_amount, reward_type,
            max_claims, max_claims_per_user, start_date, expiry_date,
            min_transaction_amount, required_service, eligibility,
            coupon_code, linked_advertisement_id, is_active
        } = payload;

        if (!name || !reward_amount || !start_date || !expiry_date) {
            throw new Error("name, reward_amount, start_date and expiry_date are required.");
        }

        if (new Date(expiry_date) <= new Date(start_date)) {
            throw new Error("expiry_date must be after start_date.");
        }

        const result = await pool.query(
            `INSERT INTO promotions
             (name, description, reward_amount, reward_type, max_claims, max_claims_per_user,
              start_date, expiry_date, min_transaction_amount, required_service, eligibility,
              coupon_code, linked_advertisement_id, is_active, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             RETURNING *`,
            [
                name, description || null, reward_amount,
                reward_type || "WALLET_CREDIT",
                max_claims || null, max_claims_per_user || 1,
                start_date, expiry_date,
                min_transaction_amount || 0, required_service || null,
                eligibility || "FIRST_TRANSACTION",
                coupon_code || null, linked_advertisement_id || null,
                Boolean(is_active), adminEmail || null
            ]
        );

        return result.rows[0];

    }

    static async update(id, fields) {

        const allowed = {
            name: "name", description: "description", reward_amount: "reward_amount",
            reward_type: "reward_type", max_claims: "max_claims",
            max_claims_per_user: "max_claims_per_user", start_date: "start_date",
            expiry_date: "expiry_date", min_transaction_amount: "min_transaction_amount",
            required_service: "required_service", eligibility: "eligibility",
            coupon_code: "coupon_code", linked_advertisement_id: "linked_advertisement_id"
        };

        const setClauses = [];
        const values = [];
        let i = 1;

        for (const [key, column] of Object.entries(allowed)) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                setClauses.push(`${column} = $${i}`);
                values.push(fields[key]);
                i += 1;
            }
        }

        if (setClauses.length === 0) {
            return this.findById(id);
        }

        setClauses.push(`updated_at = now()`);
        values.push(id);

        const result = await pool.query(
            `UPDATE promotions SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            throw new Error("Promotion not found.");
        }

        return result.rows[0];

    }

    static async setActive(id, is_active) {

        const result = await pool.query(
            `UPDATE promotions SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING *`,
            [Boolean(is_active), id]
        );

        if (result.rows.length === 0) {
            throw new Error("Promotion not found.");
        }

        return result.rows[0];

    }

    static async delete(id) {

        const result = await pool.query(`DELETE FROM promotions WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            throw new Error("Promotion not found.");
        }

        return { message: "Promotion deleted successfully." };

    }

    static async findById(id) {

        const result = await pool.query(`SELECT * FROM promotions WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
            throw new Error("Promotion not found.");
        }

        return result.rows[0];

    }

    static async listForAdmin({ limit = 50, offset = 0 } = {}) {

        const result = await pool.query(
            `SELECT * FROM promotions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return result.rows;

    }

        // Public/user-facing: only promotions currently inside their active window.
    // Joins in how many times THIS user has already claimed each one, so the
    // frontend can show a persistent "CLAIMED" state straight from the DB
    // instead of a local flag that resets on refresh.
    static async listActive(userId) {

        const result = await pool.query(
            `SELECT p.id, p.name, p.description, p.reward_amount, p.min_transaction_amount,
                    p.required_service, p.eligibility, p.start_date, p.expiry_date,
                    p.linked_advertisement_id, p.max_claims_per_user,
                    COALESCE(rl.claim_count, 0)::int AS claim_count
             FROM promotions p
             LEFT JOIN (
                 SELECT promotion_id, COUNT(*)::int AS claim_count
                 FROM reward_ledger
                 WHERE user_id = $1 AND status = 'CREDITED'
                 GROUP BY promotion_id
             ) rl ON rl.promotion_id = p.id
             WHERE p.is_active = true
               AND p.start_date <= now()
               AND p.expiry_date >= now()
             ORDER BY p.created_at DESC`,
            [userId]
        );

        return result.rows;

    }

}

module.exports = PromotionService;