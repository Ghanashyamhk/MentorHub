const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadCount,
    markNotificationsAsRead
} = require("../controllers/notificationController");

// ================= GET NOTIFICATIONS =================

router.get(
    "/",
    authMiddleware,
    getNotifications
);

// ================= GET UNREAD COUNT =================

router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);

// ================= MARK AS READ =================

router.put(
    "/mark-read",
    authMiddleware,
    markNotificationsAsRead
);

module.exports = router;