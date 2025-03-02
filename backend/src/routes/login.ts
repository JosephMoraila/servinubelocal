import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import fs from "fs";
import path from "path";

const router = Router();
const secretPath = path.join(__dirname, "../jwt_secret.key");
const JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();

router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Buscar usuario en la base de datos
    const result = await pool.query(
        "SELECT * FROM usuarios WHERE nombre_id = $1",
        [username]
    );

    const user = result.rows[0];
    if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: "1h" }
    );

    // Enviar respuesta con cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600000, // 1 hora
        path: "/"
    });

    return res.json({
        success: true,
        user: {
            id: user.id,
            nombre_publico: user.nombre_publico,
            nombre_id: user.nombre_id
        }
    });
}));

export default router;