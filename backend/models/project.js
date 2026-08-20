const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        domain: {
            type: String,
            required: true,
            enum: [
                "frontend",
                "backend",
                "fullstack",
                "aiml",
                "datascience",
                "iot",
                "devops"
            ]
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        difficulty: {
            type: String,
            required: true,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ]
        },

        contact: {
            type: String,
            required: true,
            trim: true
        },

        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        projectType: {
            type: String,
            enum: ["individual", "group"],
            required: true
        },

        maxMembers: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);