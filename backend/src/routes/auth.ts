import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";

const router = Router();

// 📌 Ruta donde se guardará la clave secreta
const secretPath = path.join(__dirname, "../jwt_secret.key");

// 📌 Verificar si ya existe una clave, si no, generarla
let JWT_SECRET: string;
if (fs.existsSync(secretPath)) {
    JWT_SECRET = fs.readFileSync(secretPath, "utf8").trim();
} else {
    JWT_SECRET = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(secretPath, JWT_SECRET);
}

console.log("JWT_SECRET cargado correctamente");

// 🔐 Función para generar el token
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

// Middleware para manejar errores en async/await
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 📌 Ruta de registro de usuario
router.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { publicName, username, password } = req.body;

    if (!publicName || !username || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query("SELECT * FROM usuarios WHERE nombre_id = $1", [username]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso." });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en la base de datos
    const result = await pool.query(
        "INSERT INTO usuarios (nombre_publico, nombre_id, password) VALUES ($1, $2, $3) RETURNING id, nombre_publico, nombre_id",
        [publicName, username, hashedPassword]
    );

    const newUser = result.rows[0];

    // Generar el JWT
    const token = generateToken(newUser.id);

    // Enviar el JWT en una cookie HttpOnly
    res.cookie("token", token, {
        httpOnly: true,  // Evita el acceso a la cookie desde JavaScript
        secure: process.env.NODE_ENV === "production",  // Asegura la cookie en HTTPS en producción
        maxAge: 3600000,  // La cookie expira en 1 hora
    });

    // Enviar respuesta sin el token en el cuerpo, ya que lo enviamos en la cookie
    res.status(201).json({
        message: "Usuario registrado con éxito",
        usuario: newUser,
    });
}));

export default router;
