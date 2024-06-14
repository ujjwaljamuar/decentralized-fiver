import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_WORKER } from "../config/config";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader, `${JWT_SECRET}`);

        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
            return res.status(403).json({
                message: `Not Logged In`,
            });
        }
    } catch (e) {
        return res.status(403).json({
            message: `Not Logged In, ${e}`,
        });
    }
}

export function workerAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader, `${JWT_SECRET_WORKER}`);

        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
            return res.status(403).json({
                message: `Not Logged In`,
            });
        }
    } catch (e) {
        return res.status(403).json({
            message: `Not Logged In, ${e}`,
        });
    }
}