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

// Middleware para procesar el userId antes de multer
const processUserIdMiddleware = (req: Request, res: Response, next: Function) => {
    // Log del body completo para debugging
    console.log("📋 Headers recibidos:", req.headers);
    console.log("📋 Body recibido:", req.body);
    next();
};

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        try {
            // Get userId from query params since formData is not yet parsed
            const userId = req.query.userId;
            const folder = req.query.folder;

            console.log("👤 UserId from query:", userId);
            console.log("📂 Folder from query:", folder);

            if (!userId) {
                console.warn("⚠️ No se encontró userId");
                return cb(new Error("userId es requerido"));
            }

            // Construir ruta base del usuario
            let targetPath = path.join(uploadDir, userId.toString());

            // Si hay una carpeta específica, añadirla a la ruta
            if (folder) {
                targetPath = path.join(targetPath, folder);
                console.log("📂 Ruta final con subcarpeta:", targetPath);
            }

            // Asegurar que la carpeta existe
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
                console.log("✅ Directorio creado:", targetPath);
            }

            console.log("✅ Usando directorio:", targetPath);
            cb(null, targetPath);
        } catch (error) {
            console.error("❌ Error en destination:", error);
            cb(error);
        }
    },
    filename: (req: any, file: any, cb: any) => {
        const timestamp = Date.now();
        const newFilename = `${timestamp}-${file.originalname}`;
        console.log("📄 Nombre del archivo generado:", newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({ storage });

// ✅ Endpoint para subir archivos
router.post("/upload", processUserIdMiddleware, (req: Request, res: Response) => {
    console.log("📤 Iniciando upload, folder en query:", req.query.folder);
    
    // Configurar multer con el middleware
    upload.single("file")(req, res, async (err: any) => {
        if (err) {
            console.error("❌ Error en multer:", err);
            return res.status(400).json({
                success: false,
                message: err.message || "Error al subir el archivo"
            });
        }

        if (!req.file) {
            console.warn("⚠️ No se proporcionó ningún archivo");
            return res.status(400).json({
                success: false,
                message: "No se ha proporcionado ningún archivo"
            });
        }

        // Log adicional para verificar la ruta final
        console.log("✅ Archivo subido en ruta:", req.file.path);

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
    });
});

// ✅ Endpoint para crear carpetas
router.post("/create-folder", asyncHandler(async (req: Request, res: Response) => {
    console.log("📂 Iniciando creación de carpeta...");
    console.log("📋 Datos recibidos:", req.body);

    const { userId, folder } = req.body;

    if (!userId || !folder) {
        return res.status(400).json({
            success: false,
            message: "Se requiere userId y nombre de carpeta"
        });
    }

    try {
        const folderPath = path.join(uploadDir, userId.toString(), folder);
        
        if (fs.existsSync(folderPath)) {
            return res.status(400).json({
                success: false,
                message: "La carpeta ya existe"
            });
        }

        await fs.promises.mkdir(folderPath, { recursive: true });
        console.log("✅ Carpeta creada:", folderPath);

        return res.status(200).json({
            success: true,
            message: "Carpeta creada correctamente",
            path: folder
        });
    } catch (error) {
        console.error("❌ Error al crear carpeta:", error);
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
        return res.status(400).json({
            success: false,
            message: "Se requiere un ID de usuario"
        });
    }

    let targetPath = path.join(uploadDir, userId.toString());
    if (folder) {
        targetPath = path.join(targetPath, folder.toString());
    }

    try {
        if (!fs.existsSync(targetPath)) {
            await fs.promises.mkdir(targetPath, { recursive: true });
        }

        const files = await fs.promises.readdir(targetPath);
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