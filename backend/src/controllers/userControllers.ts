import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { JWT_SECRET, TOTAL_DECIMALS } from "../config/config";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createTaskInput, getTaskResult } from "../types";

const prismaClient = new PrismaClient();
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
    },
    region: "ap-south-1",
});

export const getTask = async (req: Request, res: Response) => {
    // @ts-ignore
    const taskId: String = req.query.taskId;
    // @ts-ignore
    const userId: String = req.userId;

    const taskDetails = await prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId),
        },
        include: {
            options: true,
        },
    });

    if (!taskDetails) {
        return res.status(411).json({
            message: "You don't have access to this task!",
        });
    }

    // Make this faster
    const responses = await prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId),
        },
        include: {
            option: true,
        },
    });

    const results: getTaskResult = {};

    taskDetails.options.forEach((option) => {
        results[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url,
            },
        };
    });

    responses.forEach((r) => {
        results[r.option_id].count++;
    });

    res.json({
        results,
    });
};

export const addTask = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;

    const parsedData = createTaskInput.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Wrong Inputs!!",
        });
    }

    let response = await prismaClient.$transaction(async (tx) => {
        const response = await tx.task.create({
            data: {
                user_id: userId,
                title:
                    parsedData.data.title ??
                    "Select the most clickable thumbnail",
                amount: 1 * TOTAL_DECIMALS,
                signature: parsedData.data.signature,
            },
        });

        await tx.option.createMany({
            // mapping every image the if user sends more than 1 url in options
            data: parsedData.data.options.map((x) => ({
                image_url: x.imageUrl,
                task_id: response.id,
            })),
        });

        return response;
    });

    res.json({
        id: response.id,
    });
};

export const getPresignedUrl = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: `${process.env.BUCKET_NAME}`,
        Key: `${process.env.BUCKET_NAME}/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
        ],
        Expires: 3600,
    });

    res.json({
        preSignedUrl: url,
        fields,
    });
};

export const userSignIn = async (req: Request, res: Response) => {
    // verification logic
    const hardCodedWalletAddress = "qwertyuiopasdfghjklzxcvbnm";

    // upsert - create or update
    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: hardCodedWalletAddress,
        },
    });

    if (existingUser) {
        const token = jwt.sign(
            {
                userId: existingUser.id,
            },
            JWT_SECRET
        );

        res.json({
            token,
        });
    }

    // else create a new user
    else {
        const user = await prismaClient.user.create({
            data: {
                address: hardCodedWalletAddress,
            },
        });

        const token = jwt.sign(
            {
                userId: user.id,
            },
            JWT_SECRET
        );

        res.json({
            token,
        });
    }
};
