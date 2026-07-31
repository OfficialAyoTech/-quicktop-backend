const NotificationModel = require("../models/notificationModel");
const NotFoundError = require("../errors/NotFoundError");

class NotificationService {

    /**
     * Create notification
     */
    static async notify({
        user_id,
        title,
        message,
        type,
        category = null,
        metadata = {}
    }) {

        if (category) {
            const NotificationPreferenceService = require("./notificationPreferenceService");
            const enabled = await NotificationPreferenceService.isEnabled(user_id, category);
            if (!enabled) return null;
        }

        return await NotificationModel.create({
            user_id,
            title,
            message,
            type,
            category,
            metadata
        });

    }

    /**
     * Get all notifications
     */
    static async getNotifications(
        userId,
        query = {}
    ) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const offset = (page - 1) * limit;

        return await NotificationModel.findByUser(
            userId,
            limit,
            offset
        );

    }

    /**
     * Get unread notifications
     */
    static async getUnreadNotifications(userId) {

        return await NotificationModel.getUnread(userId);

    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(userId) {

        return await NotificationModel.unreadCount(userId);

    }

    /**
     * Mark one notification as read
     */
    static async markAsRead(userId, notificationId) {

        const notification =
            await NotificationModel.markAsRead(
                notificationId,
                userId
            );

        if (!notification) {
            throw new NotFoundError(
                "Notification not found."
            );
        }

        return notification;

    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId) {

        await NotificationModel.markAllAsRead(userId);

        return {
            success: true
        };

    }

    /**
     * Delete notification
     */
    static async deleteNotification(id, userId) {

        return await NotificationModel.delete(
            id,
            userId
        );

    }

}

module.exports = NotificationService;