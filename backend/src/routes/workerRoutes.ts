import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
    JWT_SECRET_WORKER,
    TOTAL_DECIMALS,
    TOTAL_SUBMISSIONS,
} from "../config/config";
import { workerAuthMiddleware } from "../middlewares/middleware";
import { getNextTask } from "../utils/utilities";
import { createSubmissionInput } from "../types";

const router = express.Router();
const prismaClient = new PrismaClient();

router.post("/payout", workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const userId: string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(userId),
        },
    });

    if (!worker) {
        return res.status(403).json({
            message: "User Not Found !!",
        });
    }

    const address = worker.address;

    const txnId = "0x235364712";

    await prismaClient.$transaction(async (tx) => {
        await tx.worker.update({
            where: {
                id: Number(userId),
            },

            data: {
                pending_amount: {
                    decrement: worker.pending_amount,
                },
                locked_amount: {
                    increment: worker.pending_amount,
                },
            },
        });

        await tx.payouts.create({
            data: {
                user_id: Number(userId),
                amount: worker.pending_amount,
                signature: txnId,
                status: "Processing",
            },
        });
    });
});

router.get("/balance", workerAuthMiddleware, async (req, res) => {
    // @ts-ignore
    const userId: string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(userId),
        },
    });

    res.json({
        worker,
    });
});

router.post("/submission", workerAuthMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const body = req.body;

    const parsedData = createSubmissionInput.safeParse(body);

    if (parsedData.success) {
        const task = await getNextTask(Number(userId));

        if (!task || task?.id !== Number(parsedData.data.taskId)) {
            return res.status(411).json({
                Message: "Incorrect task id",
            });
        }

        const amount = task.amount / TOTAL_SUBMISSIONS;

        const submission = prismaClient.$transaction(async (tx) => {
            const submission = await tx.submission.create({
                data: {
                    option_id: Number(parsedData.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedData.data.taskId),
                    amount,
                },
            });

            await tx.worker.update({
                where: {
                    id: userId,
                },
                data: {
                    pending_amount: {
                        increment: amount,
                    },
                },
            });

            return submission;
        });

        const nextTask = await getNextTask(Number(userId));

        res.json({
            nextTask,
            amountEarned: amount,
        });
    }
});

router.get("/nextTask", workerAuthMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const task = await getNextTask(userId);

    if (!task) {
        res.status(411).json({
            message: "No more task left.",
        });
    }

    res.json({
        task,
    });
});

router.post("/signin", async (req, res) => {
    // verification logic
    const hardCodedWalletAddress = "qwertyuiopasdfghjklzxcvbnmxxx";

    // upsert - create or update
    const existingUser = await prismaClient.worker.findFirst({
        where: {
            address: hardCodedWalletAddress,
        },
    });

    if (existingUser) {
        const token = jwt.sign(
            {
                userId: existingUser.id,
            },
            JWT_SECRET_WORKER
        );

        res.json({
            token,
        });
    }

    // else create a new user
    else {
        const user = await prismaClient.worker.create({
            data: {
                address: hardCodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0,
            },
        });

        const token = jwt.sign(
            {
                userId: user.id,
            },
            JWT_SECRET_WORKER
        );

        res.json({
            token,
        });
    }
});

export default router;
