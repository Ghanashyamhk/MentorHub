const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// ================= REGISTER =================

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["student", "mentor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const verificationTokenExpires = new Date(
            Date.now() + 10 * 60 * 1000
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            googleId: null,
            role,
            emailVerified: false,
            verificationToken,
            verificationTokenExpires
        });

        await sendVerificationEmail(
            user.email,
            verificationToken
        );

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= VERIFY EMAIL =================

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(
                "Verification token is missing."
            );
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).send(
                "Verification link is invalid or has expired."
            );
        }

        user.emailVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;

        await user.save();

        return res.send(`
            <html>
                <head>
                    <title>Email Verified</title>
                </head>
                <body>
                    <h1>Email Verified Successfully!</h1>
                    <p>Your MentorHub account has been verified.</p>
                    <p>You can now log in to MentorHub.</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error("Email verification error:", error);

        return res.status(500).send(
            "Something went wrong while verifying your email."
        );
    }
};

// ================= LOGIN =================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.password) {
            return res.status(401).json({
                message: "This account uses Google login. Please continue with Google."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= GOOGLE LOGIN =================

const googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const emailVerified = payload.email_verified;

        console.log("Google user:", {
            googleId,
            email,
            name,
            emailVerified
        });

        if (!emailVerified) {
            return res.status(403).json({
                message: "Google email is not verified"
            });
        }

        let user = await User.findOne({ email });

// ================= EXISTING USER =================

if (user) {

    console.log("Existing user found:", user.email);
    console.log("Role from MongoDB:", user.role);

    // Ask user to select a role
    if (!role) {
        return res.status(400).json({
            message: "Please select your role",
            roleRequired: true
        });
    }

    // Check selected role against MongoDB role
    if (role !== user.role) {
        return res.status(403).json({
            message:
                `Please select the correct role. This account is registered as ${user.role}.`,
            roleMismatch: true,
            correctRole: user.role
        });
    }

    // Google has verified the email
    user.emailVerified = true;

    // Store Google ID if not already stored
    if (!user.googleId) {
        user.googleId = googleId;
    }

    await user.save();

    // Create JWT using MongoDB role
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return res.status(200).json({
        message: "Google login successful",
        token,
        existingUser: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
        }
    });
}

        // ================= NEW USER =================

        if (!role) {
            return res.status(400).json({
                message: "Please select a role",
                roleRequired: true
            });
        }

        if (!["student", "mentor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        user = await User.create({
            name,
            email,
            password: null,
            googleId,
            role,
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpires: null
        });

        console.log("New Google user created:", user.email);
        console.log("Role:", user.role);

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            message: "Google account created successfully",
            token,
            existingUser: false,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error("========== GOOGLE LOGIN ERROR ==========");
        console.error(error);
        console.error("========================================");

        return res.status(401).json({
            message: "Google authentication failed"
        });
    }
};

// ================= PROFILE =================

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.user.userId
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// ================= EXPORT =================

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    googleLogin,
    getProfile
};