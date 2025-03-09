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
            console.log("📝 Procesando archivo:", file.originalname);
            console.log("📋 Body en destination:", req.body);

            // Obtener userId del body
            const userId = req.body.userId;
            console.log("👤 UserId encontrado:", userId);

            if (!userId) {
                console.warn("⚠️ No se encontró userId");
                return cb(new Error("userId es requerido"));
            }

            // Construir ruta de carpeta
            let userFolder = path.join(uploadDir, userId.toString());
            if (req.body.folder) {
                userFolder = path.join(userFolder, req.body.folder);
            }

            console.log("📂 Carpeta destino:", userFolder);

            // Crear carpeta si no existe
            if (!fs.existsSync(userFolder)) {
                fs.mkdirSync(userFolder, { recursive: true });
                console.log("✅ Directorio creado:", userFolder);
            }

            cb(null, userFolder);
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