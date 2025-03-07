import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const uploadDir = path.join(__dirname, "../uploads");

// Asegurar que el directorio de uploads existe
if (!fs.existsSync(uploadDir)) {
    console.log('📁 Creando directorio de uploads:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración básica de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            console.log('📝 Procesando archivo:', file.originalname);
            console.log('📋 Datos del body:', req.body);

            const folderPath = req.body.folder ? 
                path.join(uploadDir, req.body.folder) : 
                uploadDir;
            
            console.log('📂 Carpeta destino:', folderPath);
            fs.mkdirSync(folderPath, { recursive: true });
            cb(null, folderPath);
        } catch (error) {
            console.error('❌ Error al crear directorio:', error);
            cb(new Error('Error al crear el directorio'), '');
        }
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const newFilename = `${timestamp}-${file.originalname}`;
        console.log('📄 Nombre del archivo generado:', newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({ storage });

// Endpoint para subir archivos
router.post("/upload", upload.single("file"), asyncHandler(async (req: Request, res: Response) => {
    console.log('🔄 Iniciando subida de archivo...');
    
    if (!req.file) {
        console.warn('⚠️ No se proporcionó ningún archivo');
        return res.status(400).json({ 
            success: false,
            message: "No se ha proporcionado ningún archivo" 
        });
    }

    console.log('✅ Archivo subido:', {
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

// Endpoint para crear carpetas
router.post("/create-folder", asyncHandler(async (req: Request, res: Response) => {
    console.log('📂 Iniciando creación de carpeta...');
    console.log('📋 Datos recibidos:', req.body);

    const { folder } = req.body;

    if (!folder) {
        console.warn('⚠️ No se proporcionó nombre de carpeta');
        return res.status(400).json({ 
            success: false,
            message: "El nombre de la carpeta es obligatorio" 
        });
    }

    const folderPath = path.join(uploadDir, folder);
    console.log('📂 Ruta de la carpeta:', folderPath);

    if (fs.existsSync(folderPath)) {
        console.warn('⚠️ La carpeta ya existe:', folderPath);
        return res.status(400).json({ 
            success: false,
            message: "La carpeta ya existe" 
        });
    }

    await fs.promises.mkdir(folderPath, { recursive: true });
    console.log('✅ Carpeta creada exitosamente');

    return res.status(200).json({ 
        success: true,
        message: "Carpeta creada correctamente",
        path: folder
    });
}));

// Endpoint para listar archivos
router.get("/list/:folder?", asyncHandler(async (req: Request, res: Response) => {
    console.log('📂 Listando archivos...');
    const folder = req.params.folder;
    const targetPath = folder ? path.join(uploadDir, folder) : uploadDir;
    
    console.log('📂 Ruta objetivo:', targetPath);

    if (!fs.existsSync(targetPath)) {
        console.warn('⚠️ Carpeta no encontrada:', targetPath);
        return res.status(404).json({ 
            success: false,
            message: "Carpeta no encontrada" 
        });
    }

    const files = await fs.promises.readdir(targetPath);
    console.log('📄 Archivos encontrados:', files);

    return res.status(200).json({ 
        success: true,
        files 
    });
}));

export default router;