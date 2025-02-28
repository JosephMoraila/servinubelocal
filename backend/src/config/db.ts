import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Crear una función para inicializar la base de datos y la tabla
const initDb = async () => {
    const poolWithoutDb = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
    });

    const client = await poolWithoutDb.connect();
    try {
        // Verificar si la base de datos 'nube_local' existe
        const dbExists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [process.env.DB_NAME]);

        if (dbExists.rowCount === 0) {
            // Si la base de datos no existe, crearla
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Base de datos ${process.env.DB_NAME} creada.`);
        }

        // Después de crear la base de datos, nos conectamos a ella
        client.release(); // Liberar el cliente sin base de datos
        const poolWithDb = new Pool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,  // Usamos la base de datos correcta
            port: Number(process.env.DB_PORT),
        });

        // Crear la tabla 'usuarios' si no existe
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre_publico VARCHAR(100) NOT NULL,
                nombre_id VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `;
        await poolWithDb.query(createTableQuery);
        console.log("Tabla 'usuarios' creada o ya existe.");

    } catch (err) {
        console.error("Error al crear la base de datos o la tabla:", err);
    } finally {
        poolWithoutDb.end();  // Cerramos el pool sin base de datos
    }
};

// Inicializamos la base de datos y la tabla
initDb().catch((err) => console.error("Error en la inicialización de la base de datos:", err));

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
});

export default pool;
