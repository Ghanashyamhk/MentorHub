const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
    {
        // ================= STUDENT =================

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ================= PROJECT =================

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        // ================= MENTOR =================

        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ================= REQUEST STATUS =================

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected"
            ],
            default: "pending"
        }
    },

    {
        timestamps: true
    }
);


// =====================================================
// ========== PREVENT DUPLICATE REQUESTS ===============
// =====================================================

// A student can request the same project only once.
//
// Example:
//
// student A + project X  -> allowed
// student A + project X  -> blocked
//
// The same student can still request different projects.

requestSchema.index(
    {
        student: 1,
        project: 1
    },
    {
        unique: true
    }
);


// =====================================================
// ================= EXPORT MODEL =======================
// =====================================================

module.exports =
    mongoose.model(
        "Request",
        requestSchema
    );