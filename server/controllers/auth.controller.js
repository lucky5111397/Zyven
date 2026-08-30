import User from "../models/user.model.js";
import { genToken } from "../config/token.js";
import mongoose from "mongoose";

export const googleAuth = async (req, res) => {
    try {
        // -------------------------------------------------------
        // MongoDB connection check
        // -------------------------------------------------------
        if (mongoose.connection.readyState !== 1) {
            console.error("GOOGLE AUTH ERROR: MongoDB is not connected. readyState =", mongoose.connection.readyState);
            return res.status(500).json({
                success: false,
                message: "Database not connected. Please try again.",
            });
        }

        const { name, email } = req.body;

        // -------------------------------------------------------
        // Validate incoming data
        // -------------------------------------------------------
        if (!email || typeof email !== "string" || !email.trim()) {
            console.error("GOOGLE AUTH ERROR: Missing or invalid email in request body:", req.body);
            return res.status(400).json({
                success: false,
                message: "Email is required for Google authentication",
            });
        }

        if (!name || typeof name !== "string" || !name.trim()) {
            console.error("GOOGLE AUTH ERROR: Missing or invalid name in request body:", req.body);
            return res.status(400).json({
                success: false,
                message: "Name is required for Google authentication",
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        // -------------------------------------------------------
        // Find or create user
        // -------------------------------------------------------
        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            console.log("GOOGLE AUTH: Creating new user for email:", cleanEmail);
            user = await User.create({
                name: cleanName,
                email: cleanEmail,
            });
            console.log("GOOGLE AUTH: New user created:", user._id);
        } else {
            console.log("GOOGLE AUTH: Existing user found:", user._id);
        }

        // -------------------------------------------------------
        // Generate JWT
        // -------------------------------------------------------
        let token;
        try {
            token = await genToken(user._id);
        } catch (jwtError) {
            console.error("GOOGLE AUTH JWT ERROR:", jwtError);
            return res.status(500).json({
                success: false,
                message: "Failed to generate authentication token",
            });
        }

        // -------------------------------------------------------
        // Set cookie
        // -------------------------------------------------------
        res.cookie("token", token, {
            httpOnly: false,
            secure: true,          // false for HTTP localhost development
            sameSite: "none",        // "lax" works with cross-origin localhost:5173 -> localhost:8000
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("GOOGLE AUTH: Login successful for user:", user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });

    } catch (error) {
        console.error("GOOGLE AUTH UNHANDLED ERROR:", error);
        console.error("GOOGLE AUTH ERROR STACK:", error?.stack);

        return res.status(500).json({
            success: false,
            message: error?.message || "Google authentication failed",
        });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: false,
            secure: true,
            sameSite: "none",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Logout error",
        });
    }
};
