const Notification = require("../models/Notification");

// ================= GET NOTIFICATIONS =================

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.userId
        })
            .populate(
                "request",
                "project student mentor status"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json(
            notifications
        );

    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= GET UNREAD COUNT =================

const getUnreadCount = async (req, res) => {
    try {

        const unreadCount =
            await Notification.countDocuments({
                recipient: req.user.userId,
                isRead: false
            });

        return res.status(200).json({
            unreadCount
        });

    } catch (error) {

        console.error(
            "Get unread count error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= MARK ALL AS READ =================

const markNotificationsAsRead = async (req, res) => {
    try {

        await Notification.updateMany(
            {
                recipient: req.user.userId,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        return res.status(200).json({
            message: "Notifications marked as read"
        });

    } catch (error) {

        console.error(
            "Mark notifications as read error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markNotificationsAsRead
};