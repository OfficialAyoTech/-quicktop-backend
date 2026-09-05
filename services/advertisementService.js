const pool = require("../config/database");

class AdvertisementService {

    static computeEffectiveStatus(ad) {
        if (!ad.is_active) return "INACTIVE";
        const now = new Date();
        if (now < new Date(ad.start_date)) return "SCHEDULED";
        if (now > new Date(ad.expiry_date)) return "EXPIRED";
        return "ACTIVE";
    }

    static attachStatus(ad) {
        return { ...ad, effective_status: this.computeEffectiveStatus(ad) };
    }

    static async create(payload, imageUrl, adminEmail) {

        const {
            title, subtitle, button_text, button_action,
            display_order, start_date, expiry_date,
            linked_promotion_id, is_active,
            inactive_days, target_network
        } = payload;

        if (!title || !imageUrl || !start_date || !expiry_date) {
            throw new Error("title, image, start_date and expiry_date are required.");
        }

        if (new Date(expiry_date) <= new Date(start_date)) {
            throw new Error("expiry_date must be after start_date.");
        }

        const result = await pool.query(
            `INSERT INTO advertisements
             (title, subtitle, image_url, button_text, button_action, display_order,
              start_date, expiry_date, linked_promotion_id, is_active, created_by,
              inactive_days, target_network)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             RETURNING *`,
            [
                title, subtitle || null, imageUrl,
                button_text || null, button_action || null,
                display_order ? Number(display_order) : 0,
                start_date, expiry_date,
                linked_promotion_id ? Number(linked_promotion_id) : null,
                is_active === undefined ? true : (is_active === "false" ? false : Boolean(is_active)),
                adminEmail || null,
                inactive_days ? Number(inactive_days) : null,
                target_network ? String(target_network).toUpperCase() : null
            ]
        );

        return this.attachStatus(result.rows[0]);

    }

    static async update(id, fields, imageUrl) {

        const allowed = {
            title: "title", subtitle: "subtitle", button_text: "button_text",
            button_action: "button_action", display_order: "display_order",
            start_date: "start_date", expiry_date: "expiry_date",
            linked_promotion_id: "linked_promotion_id",
            inactive_days: "inactive_days", target_network: "target_network"
        };

        const setClauses = [];
        const values = [];
        let i = 1;

        for (const [key, column] of Object.entries(allowed)) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                let v = fields[key];
                if (key === "display_order") v = Number(v);
                if (key === "linked_promotion_id") v = v ? Number(v) : null;
                if (key === "inactive_days") v = (v === "" || v === null) ? null : Number(v);
                if (key === "target_network") v = v ? String(v).toUpperCase() : null;
                setClauses.push(`${column} = $${i}`);
                values.push(v);
                i += 1;
            }
        }

        if (imageUrl) {
            setClauses.push(`image_url = $${i}`);
            values.push(imageUrl);
            i += 1;
        }

        if (setClauses.length === 0) {
            return this.findById(id);
        }

        setClauses.push(`updated_at = now()`);
        values.push(id);

        const result = await pool.query(
            `UPDATE advertisements SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            throw new Error("Advertisement not found.");
        }

        return this.attachStatus(result.rows[0]);

    }

    static async setActive(id, is_active) {

        const boolVal = is_active === "false" ? false : Boolean(is_active);

        const result = await pool.query(
            `UPDATE advertisements SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING *`,
            [boolVal, id]
        );

        if (result.rows.length === 0) {
            throw new Error("Advertisement not found.");
        }

        return this.attachStatus(result.rows[0]);

    }

    static async delete(id) {

        const result = await pool.query(`DELETE FROM advertisements WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            throw new Error("Advertisement not found.");
        }

        return { message: "Advertisement deleted successfully." };

    }

    static async findById(id) {

        const result = await pool.query(`SELECT * FROM advertisements WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
            throw new Error("Advertisement not found.");
        }

        return this.attachStatus(result.rows[0]);

    }

        static async listForAdmin({ limit = 50, offset = 0 } = {}) {

        // Claims/rewards-distributed are attributed through the existing
        // linked_promotion_id relationship — an ad with no linked coupon
        // simply gets 0/null here, no attempt at click-to-purchase
        // attribution (that would need session-linking this app doesn't have).
        const result = await pool.query(
            `SELECT a.*,
                    COALESCE(rl.claim_count, 0)::int AS claim_count,
                    COALESCE(rl.rewards_distributed, 0) AS rewards_distributed
             FROM advertisements a
             LEFT JOIN (
                 SELECT promotion_id, COUNT(*)::int AS claim_count, SUM(amount) AS rewards_distributed
                 FROM reward_ledger
                 WHERE status = 'CREDITED'
                 GROUP BY promotion_id
             ) rl ON rl.promotion_id = a.linked_promotion_id
             ORDER BY a.display_order ASC, a.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return result.rows.map(ad => this.attachStatus(ad));

    }

        static async incrementImpression(id) {
        const result = await pool.query(
            `UPDATE advertisements SET impression_count = impression_count + 1
             WHERE id = $1 RETURNING impression_count`,
            [id]
        );
        if (result.rows.length === 0) {
            throw new Error("Advertisement not found.");
        }
        return result.rows[0];
    }

    static async incrementClick(id) {
        const result = await pool.query(
            `UPDATE advertisements SET click_count = click_count + 1
             WHERE id = $1 RETURNING click_count`,
            [id]
        );
        if (result.rows.length === 0) {
            throw new Error("Advertisement not found.");
        }
        return result.rows[0];
    }

    // Public/homepage: only ads currently inside their active window AND
    // matching this user's targeting (inactive_days / target_network, both
    // optional — null means "no restriction, show to everyone" as before).
    static async listActive(userId) {

        const result = await pool.query(
            `SELECT a.id, a.title, a.subtitle, a.image_url, a.button_text, a.button_action, a.linked_promotion_id
             FROM advertisements a
             LEFT JOIN LATERAL (
                 SELECT network AS last_network, created_at AS last_success_at
                 FROM transactions t
                 WHERE t.user_id = $1 AND t.status = 'successful'
                 ORDER BY t.created_at DESC
                 LIMIT 1
             ) ut ON true
             WHERE a.is_active = true
               AND a.start_date <= now()
               AND a.expiry_date >= now()
               AND (a.inactive_days IS NULL
                    OR ut.last_success_at IS NULL
                    OR ut.last_success_at < now() - (a.inactive_days || ' days')::interval)
               AND (a.target_network IS NULL OR a.target_network = ut.last_network)
             ORDER BY a.display_order ASC, a.created_at DESC`,
            [userId]
        );

        return result.rows;

    }

}

module.exports = AdvertisementService;