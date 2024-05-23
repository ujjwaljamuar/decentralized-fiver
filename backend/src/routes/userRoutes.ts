import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { JWT_SECRET } from "../config/secrets";
import { authMiddleware } from "../middlewares/middleware";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "../config/secrets";

const router = express.Router();
const prismaClient = new PrismaClient();
const s3Client = new S3Client({
    credentials: {
        accessKeyId: `${ACCESS_KEY_ID}`,
        secretAccessKey: `${SECRET_ACCESS_KEY}`,
    },
    region: "ap-south-1"
});

router.get("/presignedurl", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const command = new PutObjectCommand({
        Bucket: "dcl-fiver",
        Key: `/fiver/${userId}/${Math.random()}/image.jpg`,
        ContentType: "img/jpg",
    });

    const presignedurl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
    });

    console.log(presignedurl);

    res.json({
        presignedurl,
    });
});

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
