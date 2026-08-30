import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        // No cookie — user is unauthenticated, return 401 (not 500)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        let verifyToken;
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("isAuth JWT verify error:", jwtError.message);
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or expired token",
            });
        }

        if (!verifyToken || !verifyToken.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token payload",
            });
        }

        req.userId = verifyToken.userId;
        next();

    } catch (error) {
        console.error("isAuth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication middleware error",
        });
    }
};

export default isAuth;