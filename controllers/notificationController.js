const NotificationService = require("../services/notificationService");
const asyncHandler = require("../helpers/asyncHandler");

class NotificationController {

    /**
     * Get all notifications
     */
    static getNotifications = asyncHandler(async (req, res) => {

        const notifications =
            await NotificationService.getNotifications(
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully.",
            reference: null,
            data: notifications,
            errors: null
        });

    });

    /**
     * Get unread notification count
     */
    static getUnreadCount = asyncHandler(async (req, res) => {

        const total =
            await NotificationService.getUnreadCount(
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Unread notification count retrieved.",
            reference: null,
            data: {
                unread: total
            },
            errors: null
        });

    });

    /**
     * Mark a notification as read
     */
    static markAsRead = asyncHandler(async (req, res) => {

        const notification =
            await NotificationService.markAsRead(
                req.user.id,
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            reference: null,
            data: notification,
            errors: null
        });

    });

    /**
     * Mark all notifications as read
     */
    static markAllAsRead = asyncHandler(async (req, res) => {

        await NotificationService.markAllAsRead(
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
            reference: null,
            data: null,
            errors: null
        });

    });

}

module.exports = NotificationController;