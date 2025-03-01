import { Pool, Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

// Conectar a PostgreSQL sin especificar la base de datos para crearla si no existe
const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    database: "postgres", // Nos conectamos a "postgres" para poder crear la base de datos si no existe
});

// Crear el pool de conexión globalmente
const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
});

async function initializeDatabase() {
    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);

        if (res.rowCount === 0) {
            console.log(`⚠️ La base de datos "${DB_NAME}" no existe. Creándola...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`✅ Base de datos "${DB_NAME}" creada exitosamente.`);
        } else {
            console.log(`✅ La base de datos "${DB_NAME}" ya existe.`);
        }
    } catch (error) {
        console.error("❌ Error al verificar/crear la base de datos:", error);
    } finally {
        await client.end();
    }
}

// Ejecutar la función para verificar/crear la base de datos antes de usar `pool`
initializeDatabase().then(() => {
    console.log("🔄 Base de datos lista.");
}).catch(console.error);

export { pool };
