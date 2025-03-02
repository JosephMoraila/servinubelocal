import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const secretPath = path.join(__dirname, "../jwt_secret.key");
const JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();

router.get("/auth/validate", asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ message: "Token válido" });
    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
}));

export default router;
