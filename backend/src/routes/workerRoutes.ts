import express from "express";
import { PrismaClient } from "@prisma/client";

import { workerAuthMiddleware } from "../middlewares/middleware";
import {
    getBalance,
    nextTask,
    payout,
    submitTask,
    workerSignIn,
} from "../controllers/workerControllers";

const router = express.Router();

// Payout
router.route("/payout").post(workerAuthMiddleware, payout);

// Get Balance
router.route("/balance").get(workerAuthMiddleware, getBalance);

// Submit Task
router.route("/submission").post(workerAuthMiddleware, submitTask);

// Next Task
router.route("/nexttask").get(workerAuthMiddleware, nextTask);

// Worker Sign in
router.route("/signin").post(workerSignIn);

export default router;
