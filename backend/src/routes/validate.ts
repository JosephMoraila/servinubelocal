import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const secretPath = path.join(__dirname, "../jwt_secret.key");

let JWT_SECRET: string;

try {
    JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();
} catch (error) {
    console.error("❌ Error al leer jwt_secret.key:", error);
    process.exit(1); // Detener la ejecución si no se puede leer la clave
}

// Ruta para validar el token
// ...existing code...

router.get("/auth/validate", asyncHandler(async (req: Request, res: Response) => {
    console.log("Cookies recibidas:", req.cookies);
    const token = req.cookies.token;

    if (!token) {
        console.log("No token found in cookies");
        return res.status(401).json({ 
            authenticated: false,
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token decoded:", decoded);
        
        return res.status(200).json({ 
            authenticated: true,
            user: decoded 
        });
    } catch (error) {
        console.log("Token verification failed:", error);
        return res.status(401).json({ 
            authenticated: false,
            message: "Invalid token"
        });
    }
}));

export default router;
