import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const uploadDir = path.join(__dirname, "../uploads");

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(uploadDir)) {
    console.log("📁 Creando directorio de uploads:", uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer con ID del usuario
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            console.log("📝 Procesando archivo:", file.originalname);
            console.log("📋 Datos del body:", req.body);

            const userId = req.body.userId;
            if (!userId) {
                console.warn("⚠️ Falta el userId en la petición");
                return cb(new Error("Falta el userId en la petición"), "");
            }

            // Construir ruta de carpeta
            let userFolder = path.join(uploadDir, userId.toString());
            if (req.body.folder) {
                userFolder = path.join(userFolder, req.body.folder);
            }

            console.log("📂 Carpeta destino:", userFolder);
            fs.mkdirSync(userFolder, { recursive: true });
            cb(null, userFolder);
        } catch (error) {
            console.error("❌ Error al crear directorio:", error);
            cb(new Error("Error al crear el directorio"), "");
        }
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const newFilename = `${timestamp}-${file.originalname}`;
        console.log("📄 Nombre del archivo generado:", newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({ storage });

// ✅ Endpoint para subir archivos
router.post("/upload", upload.single("file"), asyncHandler(async (req: Request, res: Response) => {
    console.log("🔄 Iniciando subida de archivo...");

    if (!req.file) {
        console.warn("⚠️ No se proporcionó ningún archivo");
        return res.status(400).json({
            success: false,
            message: "No se ha proporcionado ningún archivo"
        });
    }

    console.log("✅ Archivo subido:", {
        nombre: req.file.filename,
        ruta: req.file.path,
        tamaño: req.file.size,
        tipo: req.file.mimetype
    });

    return res.status(200).json({
        success: true,
        message: "Archivo subido correctamente",
        file: {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
}));

// ✅ Endpoint para crear carpetas
router.post("/create-folder", asyncHandler(async (req: Request, res: Response) => {
    console.log("📂 Iniciando creación de carpeta...");
    console.log("📋 Datos recibidos:", req.body);

    const { userId, folder } = req.body;

    if (!userId || !folder) {
        console.warn("⚠️ Faltan datos requeridos");
        return res.status(400).json({
            success: false,
            message: "Se requiere userId y nombre de carpeta"
        });
    }

    try {
        const folderPath = path.join(uploadDir, userId.toString(), folder);
        console.log("📂 Ruta de la carpeta a crear:", folderPath);

        if (fs.existsSync(folderPath)) {
            console.warn("⚠️ La carpeta ya existe:", folderPath);
            return res.status(400).json({
                success: false,
                message: "La carpeta ya existe"
            });
        }

        await fs.promises.mkdir(folderPath, { recursive: true });
        console.log("✅ Carpeta creada exitosamente");

        return res.status(200).json({
            success: true,
            message: "Carpeta creada correctamente",
            path: folder
        });
    } catch (error) {
        console.error("❌ Error al crear la carpeta:", error);
        return res.status(500).json({
            success: false,
            message: "Error al crear la carpeta"
        });
    }
}));

// ✅ Endpoint para listar archivos
router.get("/list", asyncHandler(async (req: Request, res: Response) => {
    console.log("📂 Listando archivos...");
    console.log("📋 Query params:", req.query);

    const { userId, folder } = req.query;

    if (!userId) {
        console.warn("⚠️ Falta el userId en la petición");
        return res.status(400).json({
            success: false,
            message: "Se requiere un ID de usuario"
        });
    }

    let targetPath = path.join(uploadDir, userId.toString());
    if (folder) {
        targetPath = path.join(targetPath, folder.toString());
    }

    console.log("📂 Ruta objetivo:", targetPath);

    if (!fs.existsSync(targetPath)) {
        console.warn("⚠️ Carpeta no encontrada:", targetPath);
        return res.status(404).json({
            success: false,
            message: "Carpeta no encontrada"
        });
    }

    try {
        const files = await fs.promises.readdir(targetPath);
        console.log("📄 Archivos encontrados:", files);

        // Obtener información adicional de cada archivo
        const filesInfo = await Promise.all(files.map(async (file) => {
            const filePath = path.join(targetPath, file);
            const stats = await fs.promises.stat(filePath);
            return {
                name: file,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                createdAt: stats.birthtime
            };
        }));

        console.log("✅ Información de archivos procesada");

        return res.status(200).json({
            success: true,
            files: filesInfo
        });
    } catch (error) {
        console.error("❌ Error al leer archivos:", error);
        return res.status(500).json({
            success: false,
            message: "Error al leer los archivos"
        });
    }
}));

export default router;