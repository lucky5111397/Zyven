import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getAllusers, getCurrentUser } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.get("/all-users", getAllusers);

export default userRouter;