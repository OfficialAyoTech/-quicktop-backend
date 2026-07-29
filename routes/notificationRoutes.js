const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth");

const NotificationController =
    require("../controllers/notificationController");

router.get(
    "/",
    authenticateUser,
    NotificationController.getNotifications
);

router.get(
    "/unread-count",
    authenticateUser,
    NotificationController.getUnreadCount
);

router.patch(
    "/:id/read",
    authenticateUser,
    NotificationController.markAsRead
);

router.patch(
    "/read-all",
    authenticateUser,
    NotificationController.markAllAsRead
);

module.exports = router;