require("dotenv").config();


const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const Test = require("./models/Test");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

// Connect MongoDB
connectDB();

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

// Test MongoDB
app.post("/api/test", async (req, res) => {
    try {
        const test = await Test.create({
            message: "MongoDB is working!"
        });

        res.status(201).json(test);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});