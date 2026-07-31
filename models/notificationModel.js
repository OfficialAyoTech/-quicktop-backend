const pool = require("../config/database");

class NotificationModel {

    /**
     * Create Notification
     */
    static async create(notification, client = pool) {

        const {
            user_id,
            title,
            message,
            type,
            category = null,
            metadata = {}
        } = notification;

        const result = await client.query(
            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type,
                category,
                metadata
            )
            VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [
                user_id,
                title,
                message,
                type,
                category,
                metadata
            ]
        );

        return result.rows[0];

    }

    /**
     * Get all notifications for a user
     */
    static async findByUser(
        userId,
        limit = 20,
        offset = 0,
        client = pool
    ) {

        const result = await client.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET $3;
            `,
            [
                userId,
                limit,
                offset
            ]
        );

        return result.rows;

    }

    /**
     * Get unread notifications
     */
    static async getUnread(
        userId,
        client = pool
    ) {

        const result = await client.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            AND is_read = FALSE
            ORDER BY created_at DESC;
            `,
            [userId]
        );

        return result.rows;

    }

    /**
     * Get unread notification count
     */
    static async unreadCount(
        userId,
        client = pool
    ) {

        const result = await client.query(
            `
            SELECT COUNT(*)::INTEGER AS total
            FROM notifications
            WHERE user_id = $1
            AND is_read = FALSE;
            `,
            [userId]
        );

        return result.rows[0].total;

    }

    /**
     * Mark one notification as read
     */
    static async markAsRead(
        id,
        userId,
        client = pool
    ) {

        const result = await client.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            AND user_id = $2
            RETURNING *;
            `,
            [
                id,
                userId
            ]
        );

        return result.rows[0];

    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(
        userId,
        client = pool
    ) {

        await client.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1;
            `,
            [userId]
        );

        return true;

    }

    /**
     * Delete notification
     */
    static async delete(
        id,
        userId,
        client = pool
    ) {

        const result = await client.query(
            `
            DELETE FROM notifications
            WHERE id = $1
            AND user_id = $2
            RETURNING *;
            `,
            [
                id,
                userId
            ]
        );

        return result.rows[0];

    }

}

module.exports = NotificationModel;