import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET_WORKER } from "../config/config";
import { workerAuthMiddleware } from "../middlewares/middleware";
import { getNextTask } from "../utils/utilities";
import { createSubmissionInput } from "../types";
import { Message } from "@solana/web3.js";

const router = express.Router();
const prismaClient = new PrismaClient();

const TOTAL_SUBMISSIONS = 100;

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
            const submission = await giprismaClient.submission.create({
                data: {
                    option_id: Number(parsedData.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedData.data.taskId),
                    amount,
                },
            });

            await prismaClient.worker.update({
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

    const task = await prismaClient.task.findFirst({
        where: {
            submissions: {
                none: {
                    worker_id: userId,
                },
            },
            done: false,
        },

        select: {
            title: true,
            options: true,
        },
    });

    if (!task) {
        res.status(411).json({
            message: "No more task left.",
        });
    }

    res.json({
        task,
    });
});

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxNjk4NTg1OX0.NjtSary98_BfQDcC9JMCewfgVcJhbbg3eidyh0csTQU
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
