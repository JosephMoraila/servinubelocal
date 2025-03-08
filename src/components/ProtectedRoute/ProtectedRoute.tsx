import React, { useState, useEffect, createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";

// Crear contexto de autenticación
const AuthContext = createContext<{ userId: string | null }>({ userId: null });

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/validate", {
          withCredentials: true,
        });

        if (response.data.authenticated && response.data.user) {
          setIsAuthenticated(true);
          setUserId(response.data.user.id); // Guardamos el userId
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default ProtectedRoute;
