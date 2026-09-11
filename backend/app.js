const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);

// Home
app.get("/", (req, res) => {
    res.send("Mentor Platform Backend Running");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "API is working"
    });
});
// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "MentorHub backend is healthy"
    });
});

module.exports = app;