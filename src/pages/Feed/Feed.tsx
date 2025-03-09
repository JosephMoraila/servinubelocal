import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../components/ProtectedRoute/ProtectedRoute"; // Importamos el contexto de autenticación

const Feed = () => {
  const { userId } = useAuth(); // Obtenemos el userId del contexto
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>("");

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId]);

  // Obtener lista de archivos y carpetas
  const fetchFiles = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/list`, {
        params: { folder: currentFolder, userId }, // Enviamos userId
      });
      console.log("📂 Archivos recibidos:", response.data.files);

      // Transformar los datos recibidos al formato esperado
      const formattedFiles = response.data.files.map((file: { name: string }) => ({
        name: file.name,
        isDirectory: !file.name.includes("."), // Método simple para detectar carpetas
      }));
      

      setFiles(formattedFiles);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  };

  // Crear carpeta
  const createFolder = async () => {
    if (!folderName || !userId) {
      alert("Ingrese un nombre para la carpeta o inicie sesión.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/create-folder", {
        folder: currentFolder ? `${currentFolder}/${folderName}` : folderName,
        userId, // Enviamos el userId
      });
      console.log("✅ Carpeta creada:", folderName);

      fetchFiles();
      setFolderName("");
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
      alert("Error al crear la carpeta");
    }
  };

  // Subir archivo
  const uploadFile = async () => {
    if (!selectedFile || !userId) {
      alert("Seleccione un archivo o inicie sesión.");
      return;
    }

    console.log("📤 Iniciando subida con userId:", userId);

    const formData = new FormData();
    // Importante: Agregar el userId primero
    formData.append("userId", userId.toString());
    formData.append("file", selectedFile);
    if (currentFolder) {
      formData.append("folder", currentFolder);
    }

    // Para debugging: mostrar contenido del FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });

      if (response.data.success) {
        console.log("✅ Archivo subido:", selectedFile.name);
        await fetchFiles(); // Esperar a que se actualice la lista
        setSelectedFile(null);
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error: any) {
      console.error("❌ Error al subir archivo:", error.response?.data || error);
      alert(error.response?.data?.message || "Error al subir el archivo");
    }
};

  // Navegar a una carpeta
  const navigateToFolder = (folderName: string) => {
    setCurrentFolder((prev) => (prev ? `${prev}/${folderName}` : folderName));
  };

  // Volver a la carpeta anterior
  const goBack = () => {
    setCurrentFolder((prev) => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  return (
    <div className="feed-container">
      <h1>Archivos y Carpetas</h1>

      {/* Navegación de carpetas */}
      <div className="navigation">
        {currentFolder && <button onClick={goBack}>⬅️ Volver</button>}
        <span>📂 {currentFolder || "Raíz"}</span>
      </div>

      {/* Crear carpeta */}
      <div className="folder-creation">
        <input
          type="text"
          placeholder="Nombre de la carpeta"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <button onClick={createFolder}>Crear Carpeta</button>
      </div>

      {/* Subir archivo */}
      <div className="file-upload">
        <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        <button onClick={uploadFile} disabled={!selectedFile}>
          Subir Archivo
        </button>
      </div>

      {/* Lista de archivos y carpetas */}
      <ul className="files-list">
        {files.map((file, index) => (
          <li key={index} className={file.isDirectory ? "directory" : "file"}>
            {file.isDirectory ? (
              <span onClick={() => navigateToFolder(file.name)} style={{ cursor: "pointer" }}>
                📁 {file.name}
              </span>
            ) : (
              <span>📄 {file.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;
