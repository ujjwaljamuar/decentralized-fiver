import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/secrets";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET);

        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
            res.status(403).json({
                message: `Not Logged In`,
            });
        }
    } catch (e) {
        res.status(403).json({
            message: `Not Logged In, ${e}`,
        });
    }
}
