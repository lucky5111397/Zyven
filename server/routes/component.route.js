import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { generateComponent } from "../controllers/aicomponent.controller.js";
import {
    getAllComponents,
    getMyComponents,
    publishComponent,
    saveComponent
} from "../controllers/component.controller.js";

const componentRouter = express.Router();

componentRouter.post("/generate", isAuth, generateComponent);
componentRouter.post("/save", isAuth, saveComponent);
componentRouter.post("/publish", isAuth, publishComponent);
componentRouter.post("/publish/:id", isAuth, publishComponent);
componentRouter.get("/my-components", isAuth, getMyComponents);
componentRouter.get("/all-components", getAllComponents);

export default componentRouter;