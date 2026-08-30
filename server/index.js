import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { connectDb } from "./config/connectDB.js";

import cookieParser from "cookie-parser";

import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import componentRouter from "./routes/component.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json("Hello from Zyven Server");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/component", componentRouter);
app.use("/api/payment", paymentRouter);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err);
  console.error("GLOBAL ERROR STACK:", err?.stack);

  res.status(500).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Zyven Server Started on port ${PORT}`);
  connectDb();
});
