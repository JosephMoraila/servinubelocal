import { useState, useEffect } from "react";
import axios from "axios";

const Feed = () => {
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  
  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  // Obtener lista de archivos y carpetas
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/list${currentFolder ? `/${currentFolder}` : ''}`);
      console.log('📂 Archivos recibidos:', response.data);
      
      // Transformar los datos recibidos al formato esperado
      const formattedFiles = response.data.files.map((file: string) => ({
        name: file,
        isDirectory: !file.includes('.') // Método simple para detectar carpetas
      }));
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  };

  // Crear carpeta
  const createFolder = async () => {
    if (!folderName) {
      alert("Por favor, ingrese un nombre para la carpeta");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/create-folder", { 
        folder: currentFolder ? `${currentFolder}/${folderName}` : folderName 
      });
      console.log('✅ Carpeta creada:', folderName);
      
      fetchFiles();
      setFolderName("");
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
      alert("Error al crear la carpeta");
    }
  };

  // Subir archivo
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Por favor, seleccione un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (currentFolder) {
      formData.append("folder", currentFolder);
    }

    try {
      await axios.post("http://localhost:3000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log('✅ Archivo subido:', selectedFile.name);
      
      fetchFiles();
      setSelectedFile(null);
      // Limpiar el input de archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
      alert("Error al subir el archivo");
    }
  };

  // Navegar a una carpeta
  const navigateToFolder = (folderName: string) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  // Volver a la carpeta anterior
  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split('/');
      parts.pop();
      return parts.join('/');
    });
  };

  return (
    <div className="feed-container">
      <h1>Archivos y Carpetas</h1>
      
      {/* Navegación de carpetas */}
      <div className="navigation">
        {currentFolder && (
          <button onClick={goBack}>⬅️ Volver</button>
        )}
        <span>📂 {currentFolder || 'Raíz'}</span>
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
        <input 
          type="file" 
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button onClick={uploadFile} disabled={!selectedFile}>
          Subir Archivo
        </button>
      </div>

      {/* Lista de archivos y carpetas */}
      <ul className="files-list">
        {files.map((file, index) => (
          <li key={index} className={file.isDirectory ? 'directory' : 'file'}>
            {file.isDirectory ? (
              <span onClick={() => navigateToFolder(file.name)} style={{cursor: 'pointer'}}>
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