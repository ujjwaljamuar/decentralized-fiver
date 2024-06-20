import { Request, Response } from "express";
import nacl from "tweetnacl";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { TOTAL_DECIMALS, WORKER_JWT_SECRET } from "../config/config";
import { getNextTask } from "../utils/utilities";
import { createSubmissionInput } from "../types";
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { privateKey } from "../config/config";
import { decode } from "bs58";

const connection = new Connection(process.env.RPC_URL ?? "");

const TOTAL_SUBMISSIONS = 100;

const prismaClient = new PrismaClient();

prismaClient.$transaction(
    async (prisma) => {
        // Code running in a transaction...
    },
    {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
    }
);

export const payout = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId: string = req.userId;
    const worker = await prismaClient.worker.findFirst({
        where: { id: Number(userId) },
    });

    if (!worker) {
        return res.status(403).json({
            message: "User not found",
        });
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(
                "AWV6G67qjQvD9VK5273YBwm1XkHDdY6nsc811FhkdFpN"
            ),
            toPubkey: new PublicKey(worker.address),
            lamports: (1000_000_000 * worker.pending_amount) / TOTAL_DECIMALS,
        })
    );

    console.log("worker transaction - \n", transaction);

    const keypair = Keypair.fromSecretKey(
        decode(process.env.USER_ACCOUNT_PRIVATE_KEY ?? "")
    );

    // TODO: There's a double spending problem here
    // The user can request the withdrawal multiple times
    // Can u figure out a way to fix it?
    let signature = "";
    try {
        signature = await sendAndConfirmTransaction(connection, transaction, [
            keypair,
        ]);
    } catch (e) {
        return res.json({
            message: "Transaction failed",
        });
    }

    console.log(signature);

    // We should add a lock here
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
                status: "Processing",
                signature: signature,
            },
        });
    });

    res.json({
        message: "Processing payout",
        amount: worker.pending_amount,
    });
};

export const getBalance = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId: string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(userId),
        },
    });

    res.json({
        pendingAmount: worker?.pending_amount,
        lockedAmount: worker?.pending_amount,
    });
};

export const submitTask = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);

    if (parsedBody.success) {
        const task = await getNextTask(Number(userId));
        if (!task || task?.id !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id",
            });
        }

        const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();

        const submission = await prismaClient.$transaction(async (tx) => {
            const submission = await tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedBody.data.taskId),
                    amount: Number(amount),
                },
            });

            await tx.worker.update({
                where: {
                    id: userId,
                },
                data: {
                    pending_amount: {
                        increment: Number(amount),
                    },
                },
            });

            return submission;
        });

        const nextTask = await getNextTask(Number(userId));
        res.json({
            nextTask,
            amount,
        });
    } else {
        res.status(411).json({
            message: "Incorrect inputs",
        });
    }
};

export const nextTask = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId: string = req.userId;

    const task = await getNextTask(Number(userId));

    if (!task) {
        res.status(411).json({
            message: "No more tasks.",
        });
    } else {
        res.json({
            task,
        });
    }
};

export const workerSignIn = async (req: Request, res: Response) => {
    // const hardCodedWalletAddress = "qwertyuiopasdfghjklzxcvbnmxxx";

    const { publicKey, signature } = req.body;
    const message = new TextEncoder().encode("Sign in to TLabll as a worker");

    const result = nacl.sign.detached.verify(
        message,
        new Uint8Array(signature.data),
        new PublicKey(publicKey).toBytes()
    );

    if (!result) {
        return res.status(411).json({
            message: "Incorrect signature",
        });
    }

    const existingUser = await prismaClient.worker.findFirst({
        where: {
            address: publicKey,
            // address: hardCodedWalletAddress,
        },
    });

    if (existingUser) {
        const token = jwt.sign(
            {
                userId: existingUser.id,
            },
            WORKER_JWT_SECRET
        );

        res.json({
            token,
            amount: existingUser.pending_amount / TOTAL_DECIMALS,
        });
    } else {
        const user = await prismaClient.worker.create({
            data: {
                address: publicKey,
                // address: hardCodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0,
            },
        });

        const token = jwt.sign(
            {
                userId: user.id,
            },
            WORKER_JWT_SECRET
        );

        res.json({
            token,
            amount: 0,
        });
    }
};
