import { useEffect, useState, FormEvent } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMessageBoxContext } from '../../contexts/MessageBoxContext';
import axios from 'axios';
import './Register.css'

const Register = () => {
  const navigate = useNavigate();
  const {setMessageMessageBox} = useMessageBoxContext();

  // Estados del formulario
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    nameID: '',
    userName: '',
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  // Estados de UI
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const [error, setError] = useState('');
  const storedStep = localStorage.getItem('stepRegister');
  const [currentStep, setCurrentStep] = useState(storedStep ? Number(storedStep) : 1);
  const totalSteps = 2;

  // Manejadores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

// ...existing code...

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setError("Las contraseñas no coinciden");
    return;
  }

  try {
    const response = await axios.post("http://localhost:3000/api/register", {
      publicName: formData.userName,
      username: formData.nameID,
      password: formData.password,
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      setMessageMessageBox("Registro exitoso");
      navigate('/feed');
    }
  } catch (error: any) {
    console.error("Error al registrar:", error);
    setError(error.response?.data?.message || "Error en el registro");
  }
};

  return (
    <div className={`register-container ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
      <h1>Registro</h1>
      
      <form className="register-form" onSubmit={handleSubmit}>
        <>

          <div className="form-group">
            <div className="label-help-container">
              <label htmlFor="userName">Nombre público:</label>
              <span className="help-icon">?
                <span className="tooltip">
                  Este nombre será visible para otros usuarios en la plataforma
                </span>
              </span>
            </div>
            <input
              type="text"
              id="userName"
              value={formData.userName}
              onChange={handleInputChange}
              required
            />
          </div>


            <div className="form-group">
              <div className="label-help-container">
                <label htmlFor="nameID">Nombre ID:</label>
                <span className="help-icon">?
                  <span className="tooltip">
                    Este nombre será el que uses para iniciar sesión en la plataforma como si fuera tu correo electrónico en una página web
                  </span>
                </span>
              </div>
              <input
                type="text"
                id="nameID"
                value={formData.nameID}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <div className="password-input-container">
                <input
                  type={showPassword.password ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(prev => ({
                    ...prev,
                    password: !prev.password
                  }))}
                >
                  {showPassword.password ? "🔒" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña:</label>
              <div className="password-input-container">
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(prev => ({
                    ...prev,
                    confirmPassword: !prev.confirmPassword
                  }))}
                >
                  {showPassword.confirmPassword ? "🔒" : "👁️"}
                </button>
              </div>
            </div>
          </>
        <button type="submit" className="register-button">Registrar</button>
        {error && <p className="error-message">{error}</p>}

      </form>

      <p className="register-link">
        ¿Ya tienes cuenta?{' '}
        <span 
          onClick={() => navigate('/login')} 
          style={{ cursor: 'pointer', color: '#3d9bff'}}
        >
          Iniciar sesión
        </span>
      </p>
    </div>
  );
};

export default Register;