import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import '../../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');





  return (
    <div className={`register-container ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
      <h1>Iniciar Sesión</h1>
      <form  className="register-form">
        <div className="form-group">
          <label htmlFor="email">Nombre ID:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="success-message">{resetMessage}</p>}

        <button type="submit" className="register-button">
          Iniciar Sesión
        </button>
        <p className="reset-link">
          ¿Olvidaste tu contraseña?{' '}
          <span

            style={{ cursor: 'pointer', color: '#3d9bff' }}
          >
            Restablecer Contraseña
          </span>
        </p>
        <p className="register-link">
          ¿No tienes cuenta?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ cursor: 'pointer', color: '#3d9bff' }}
          >
            Regístrate
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
