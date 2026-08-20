const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerUser,
    verifyEmail,
    loginUser,
    googleLogin,
    getProfile
} = require("../controllers/authController");


// Register
router.post("/register", registerUser);


// Verify email
router.get("/verify-email", verifyEmail);

// Google Login
router.post("/google", googleLogin);


// Login
router.post("/login", loginUser);


// Profile
router.get("/profile", authMiddleware, getProfile);


module.exports = router;