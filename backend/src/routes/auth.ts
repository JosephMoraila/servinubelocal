import express, { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../config/db"; // Aquí importamos el pool de db.ts
import dotenv from "dotenv";

dotenv.config();
const router = Router();

// Middleware para manejar async/await en Express
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Crear base de datos si no existe
const createDatabaseIfNeeded = async () => {
    const client = await pool.connect();
    try {
        // Verificar si la base de datos 'nube_local' existe
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ['nube_local']);
        if (res.rowCount === 0) {
            // Si no existe, crear la base de datos
            console.log("La base de datos 'nube_local' no existe. Creándola...");
            await client.query("CREATE DATABASE nube_local");
        } else {
            console.log("La base de datos 'nube_local' ya existe.");
        }
    } catch (err) {
        console.error("Error al verificar o crear la base de datos:", err);
    } finally {
        client.release();
    }
};

// Crear tabla 'usuarios' si no existe
const createTableIfNeeded = async () => {
    const client = await pool.connect();
    try {
        // Crear la tabla 'usuarios' si no existe
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre_publico VARCHAR(100),
                nombre_id VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `;
        await client.query(createTableQuery);
        console.log("La tabla 'usuarios' ha sido creada o ya existe.");
    } catch (err) {
        console.error("Error al crear la tabla 'usuarios':", err);
    } finally {
        client.release();
    }
};

router.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { publicName, username, password } = req.body;

    console.log(req.body);

    // Verificar que los campos no estén vacíos
    if (!publicName || !username || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Verificar que la base de datos y la tabla existan
    await createDatabaseIfNeeded();  // Verifica y crea la base de datos si no existe
    await createTableIfNeeded();     // Verifica y crea la tabla si no existe

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
