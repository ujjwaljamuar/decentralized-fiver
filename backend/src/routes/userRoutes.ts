import express from "express";

import { authMiddleware } from "../middlewares/middleware";
import {
    addTask,
    getTask,
    getPresignedUrl,
    userSignIn,
} from "../controllers/userControllers";

const router = express.Router();

// Get Task
router.route("/task").get(authMiddleware, getTask);

// Post Task
router.route("/task").post(authMiddleware, addTask);

// preSignedUrl
router.route("/presignedurl").get(authMiddleware, getPresignedUrl);

// SIGN IN WITH WALLET
// SIGNING A MESSAGE
router.route("/signin").post(userSignIn);

export default router;
