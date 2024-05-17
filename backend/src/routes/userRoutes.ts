import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { JWT_SECRET } from "..";

const router = express.Router();

const prismaClient = new PrismaClient();

router.get("/presignedurl",authMiddleware, (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const command = new PutObjectCommand({
        Bucket: "bucket-name",
        Key: "/fiver",

    })
})

// SIGN IN WITH WALLET
// SIGNING A MESSAGE
router.post("/signin", async (req, res) => {
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
});

export default router;
