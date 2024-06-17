import express from "express";

import { workerMiddleware } from "../middlewares/middleware";
import {
    getBalance,
    nextTask,
    payout,
    submitTask,
    workerSignIn,
} from "../controllers/workerControllers";

const router = express.Router();

// Payout
router.route("/payout").post(workerMiddleware, payout);

// Get Balance
router.route("/balance").get(workerMiddleware, getBalance);

// Submit Task
router.route("/submission").post(workerMiddleware, submitTask);

// Next Task
router.route("/nextTask").get(workerMiddleware, nextTask);

// Worker Sign in
router.route("/signin").post(workerSignIn);

export default router;
