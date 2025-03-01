import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";

const router = Router();

// Middleware para manejar async/await en Express
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Verificar si la tabla "usuarios" existe y crearla si no
const checkAndCreateTable = async () => {
    try {
        const result = await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre_publico VARCHAR(255) NOT NULL,
                nombre_id VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
        console.log("Tabla 'usuarios' verificada o creada con éxito.");
    } catch (error) {
        console.error("Error al verificar o crear la tabla 'usuarios':", error);
    }
};

// Llamar a la función para asegurarse de que la tabla existe al arrancar el servidor
checkAndCreateTable();

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
        "INSERT INTO usuarios (nombre_publico, nombre_id, password) VALUES ($1, $2, $3) RETURNING *",
        [publicName, username, hashedPassword]
    );

    return res.status(201).json({ message: "Usuario registrado", usuario: result.rows[0] });
}));

export default router;
