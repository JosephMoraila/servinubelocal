import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../components/ProtectedRoute/ProtectedRoute";
import "./Feed.css";
import { useDarkMode } from '../../contexts/DarkModeContext'

interface FileProgress {
  name: string;
  progress: number;
}

const Feed = () => {
  const { userId } = useAuth();
  const [files, setFiles] = useState<{ name: string; isDirectory: boolean }[]>([]);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { effectiveMode } = useDarkMode();

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [currentFolder, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
  
    setUploading(true);
    setUploadProgress(selectedFiles.map(file => ({ name: file.name, progress: 0 })));
  
    try {
      // Upload files in parallel using Promise.all
      await Promise.all(selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        await axios.post("http://localhost:3000/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          params: {
            userId,
            folder: currentFolder
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
            setUploadProgress(prev => 
              prev.map(item => 
                item.name === file.name 
                  ? { ...item, progress: percentCompleted }
                  : item
              )
            );
          }
        });
      }));
  
      console.log("✅ Todos los archivos se subieron correctamente");
      await fetchFiles();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("❌ Error al subir archivos:", error);
      alert("Error al subir uno o más archivos");
    } finally {
      setUploading(false);
      setUploadProgress([]);
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

  return (
    <div className={`feed-container ${effectiveMode === 'dark' ? 'dark' : ''}`}>
      <div className={`feed-header ${effectiveMode === 'dark' ? 'dark' : ''}`}>
        <h1 className={`feed-title ${effectiveMode === 'dark' ? 'dark' : ''}`}>Mi unidad</h1>
        <div className={`new-button ${effectiveMode === 'dark' ? 'dark' : ''}`} ref={menuRef}>
          <button onClick={handleNewClick}>
            <span>➕</span>
            Nuevo
          </button>
          {showNewMenu && (
            <div className={`new-menu ${effectiveMode === 'dark' ? 'dark' : ''}`}>
              <div className="menu-item" onClick={handleCreateFolderClick}>
                <span className="icon">📁</span>
                Nueva carpeta
              </div>
              <div className="menu-item" onClick={handleUploadClick}>
                <span className="icon">📤</span>
                Subir archivos
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navigation">
        {currentFolder && (
          <button onClick={goBack} className={`button-back-folder ${effectiveMode === 'dark' ? 'dark' : ''}`}>⬅️ Volver</button>
        )}
        <span>📂 {currentFolder || "Mi unidad"}</span>
      </div>

      <div className="files-container">
        <div className="files-grid">
          {files.map((file, index) => (
            <div
              key={index}
              className={`file-item ${effectiveMode === 'dark' ? 'dark' : ''}`}
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
        multiple
        accept="*/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      {/* Upload progress indicator */}
      {uploading && uploadProgress.length > 0 && (
        <div className={`upload-progress ${effectiveMode === 'dark' ? 'dark' : ''}`}>
          {uploadProgress.map((file) => (
            <div key={file.name} className={`progress-item ${effectiveMode === 'dark' ? 'dark' : ''}`}>
              <span className="filename">{file.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
              <span className="progress-text">{file.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Folder creation modal */}
      {showFolderModal && (
        <div className="modal">
          <div className={`modal-content ${effectiveMode === 'dark' ? 'dark' : ''}`}>
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