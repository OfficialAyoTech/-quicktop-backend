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
            linked_promotion_id, is_active
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
              start_date, expiry_date, linked_promotion_id, is_active, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
             RETURNING *`,
            [
                title, subtitle || null, imageUrl,
                button_text || null, button_action || null,
                display_order ? Number(display_order) : 0,
                start_date, expiry_date,
                linked_promotion_id ? Number(linked_promotion_id) : null,
                is_active === undefined ? true : (is_active === "false" ? false : Boolean(is_active)),
                adminEmail || null
            ]
        );

        return this.attachStatus(result.rows[0]);

    }

    static async update(id, fields, imageUrl) {

        const allowed = {
            title: "title", subtitle: "subtitle", button_text: "button_text",
            button_action: "button_action", display_order: "display_order",
            start_date: "start_date", expiry_date: "expiry_date",
            linked_promotion_id: "linked_promotion_id"
        };

        const setClauses = [];
        const values = [];
        let i = 1;

        for (const [key, column] of Object.entries(allowed)) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                let v = fields[key];
                if (key === "display_order") v = Number(v);
                if (key === "linked_promotion_id") v = v ? Number(v) : null;
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

        const result = await pool.query(
            `SELECT * FROM advertisements ORDER BY display_order ASC, created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return result.rows.map(ad => this.attachStatus(ad));

    }

    // Public/homepage: only ads currently inside their active window.
    static async listActive() {

        const result = await pool.query(
            `SELECT id, title, subtitle, image_url, button_text, button_action, linked_promotion_id
             FROM advertisements
             WHERE is_active = true
               AND start_date <= now()
               AND expiry_date >= now()
             ORDER BY display_order ASC, created_at DESC`
        );

        return result.rows;

    }

}

module.exports = AdvertisementService;