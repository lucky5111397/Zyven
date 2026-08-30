import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`DB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("DB Connection Error:", error.message);
        // Exit process on DB connection failure so nodemon restarts cleanly
        process.exit(1);
    }
};