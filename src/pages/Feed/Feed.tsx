import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../components/ProtectedRoute/ProtectedRoute";
import "./Feed.css";

const Feed = () => {
  const { userId } = useAuth();
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId]);

  const fetchFiles = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/list`, {
        params: { folder: currentFolder, userId },
        withCredentials: true
      });
      
      const formattedFiles = response.data.files.map((file: { name: string }) => ({
        name: file.name,
        isDirectory: !file.name.includes("."),
      }));
      
      setFiles(formattedFiles);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  };

  const createFolder = async () => {
    if (!folderName || !userId) {
      alert("Ingrese un nombre para la carpeta");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/create-folder", {
        folder: currentFolder ? `${currentFolder}/${folderName}` : folderName,
        userId,
      });

      await fetchFiles();
      setFolderName("");
      setShowFolderModal(false);
    } catch (error) {
      console.error("❌ Error al crear carpeta:", error);
      alert("Error al crear la carpeta");
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !userId) {
      alert("Seleccione un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      const response = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        params: {
          userId,
          folder: currentFolder
        }
      });

      if (response.data.success) {
        await fetchFiles();
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error: any) {
      console.error("❌ Error al subir archivo:", error);
      alert("Error al subir el archivo");
    }
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentFolder(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  const goBack = () => {
    setCurrentFolder(prev => {
      const parts = prev.split("/");
      parts.pop();
      return parts.join("/");
    });
  };

  const handleNewClick = () => {
    setShowNewMenu(!showNewMenu);
  };

  const handleCreateFolderClick = () => {
    setShowNewMenu(false);
    setShowFolderModal(true);
  };

  const handleUploadClick = () => {
    setShowNewMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          params: {
            userId,
            folder: currentFolder
          }
        });
  
        if (response.data.success) {
          console.log("✅ Archivo subido correctamente");
          await fetchFiles();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } catch (error: any) {
        console.error("❌ Error al subir archivo:", error);
        alert("Error al subir el archivo");
      }
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1 className="feed-title">Mi unidad</h1>
        <div className="new-button">
          <button onClick={handleNewClick}>
            <span>➕</span>
            Nuevo
          </button>
          {showNewMenu && (
            <div className="new-menu">
              <div className="menu-item" onClick={handleCreateFolderClick}>
                <span className="icon">📁</span>
                Nueva carpeta
              </div>
              <div className="menu-item" onClick={handleUploadClick}>
                <span className="icon">📤</span>
                Subir archivo
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navigation">
        {currentFolder && (
          <button onClick={goBack}>⬅️ Volver</button>
        )}
        <span>📂 {currentFolder || "Mi unidad"}</span>
      </div>

      <div className="files-container">
        <div className="files-grid">
          {files.map((file, index) => (
            <div
              key={index}
              className="file-item"
              onClick={() => file.isDirectory && navigateToFolder(file.name)}
            >
              <div className="file-icon">
                {file.isDirectory ? "📁" : "📄"}
              </div>
              <div className="file-name">{file.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
      type="file"
      ref={fileInputRef}
      style={{ display: "none" }}
      onChange={handleFileSelect}
    />

      {/* Folder creation modal */}
      {showFolderModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Nueva carpeta</h2>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="cancel"
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName("");
                }}
              >
                Cancelar
              </button>
              <button
                className="confirm"
                onClick={createFolder}
                disabled={!folderName.trim()}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;