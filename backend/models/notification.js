const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "new_request",
                "request_accepted",
                "request_rejected"
            ],
            required: true
        },

        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Notification",
        notificationSchema
    );