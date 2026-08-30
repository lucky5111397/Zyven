import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error("GET CURRENT USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error?.message || "Failed to get current user",
        });
    }
};

export const getAllusers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        return res.status(200).json(users);

    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error?.message || "Failed to get all users",
        });
    }
};