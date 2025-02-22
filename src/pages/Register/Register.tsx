import { useEffect, useState, FormEvent } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { NavLink, useNavigate } from 'react-router-dom';
import './Register.css';2
import LoadingBar from '../../components/LoadingProgressBar/LoadingProgressBar';

const Registro = () => {
  //Se usa navigate para mandar al usuario a otro enlace
  const navigate = useNavigate();

  // Estados para manejar los datos del formulario. Se usa useState para volver a renderizar el componente con otro valor
  const [email, setEmail] = useState<string>(''); //Definimos un estado de la variable email de tipo string con valor inicial de ''
                                                  // y setEmail que es una función que podemos usar para ponerle un valor a email
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [country, setCountry] = useState<string>(''); // País seleccionado
  const [state, setState] = useState<string>(''); // Estado ingresado
  const [city, setCity] = useState<string>(''); // Ciudad ingresada
  const [isLoadingBar, setIsLoadingBar] = useState<boolean>(false);  // Estado para la barra de carga

  const [error, setError] = useState<string>('');

  // Obtener el paso actual desde localStorage o iniciar en 1. (Se hace si se recarga la página y no se quiere perder donde iba)
  const storedStep = localStorage.getItem('stepRegister');
  //Si storedSTep no es null (hay un paso guardado) storedStep se convierte a Number y currentStep se guarda con ese valor, sino, es 1
  const [currentStep, setCurrentStep] = useState<number>(storedStep ? Number(storedStep) : 1);

  //Definimos el total de pasos que lleva el registro
  const totalSteps = 2;

  // Lista de países latinoamericanos predefinidos
 

  // Manejador para volver al paso anterior
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1); // Restar uno al paso actual
    }
  };

  //Este retirn devuelve el HTML a insertar en la página
  return (
    //Como vemos usamos el provedor de dark mode para saber si lo es y cambiar su classname a register-container.dark para que el css cambie el color
    <div className={`register-container ${useDarkMode().effectiveMode === 'dark' ? 'dark' : ''}`}>
      <LoadingBar isLoading={isLoadingBar} /> {/*Se coloca la barra de caraga y se le pasa el argumento para saber si debe aparecer o no*/}
      <h1>Registro</h1>
      
      {/*onSubmit es la función que se va ejeuctar cuando se pique enviar o enter en el formulario*/}
      <form className="register-form">
        {/* Paso 1: Información Personal. Si el paso es el primero entonces con && se agrega el contenido HTML*/}
        {currentStep === 1 && (
          <>
            <div className="form-group register-form-option">


            </div>

            <div className="form-group">
              <label htmlFor="name">Nombre del negocio:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono del negocio (Con lada):</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.trim())}
                placeholder='No obligatorio'
              />
            </div>

            <div className="form-group register-form-option">

            </div>

            <div className="form-group">
              <label htmlFor="state">Estado/Provincia:</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ciudad:</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Paso 2: Credenciales de Cuenta. Si el paso es el 2 con && se agrega el contenido HTML*/}
        {currentStep === 2 && (
          <>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico:</label>
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
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group terms">
              <input type="checkbox" required />
              <label>
                Acepto los <NavLink to="/Terms">Términos de Servicio</NavLink> y la{' '}
                <NavLink to="/Privacy">Política de Privacidad</NavLink>
              </label>
            </div>
          </>
        )}

        {/* Mensaje de error si hay uno */}
        {error && <p className="error-message">{error}</p>}

        <div className="button-container">
          {/* Botón "Volver" para regresar al paso anterior si se está en el 2*/}
          {currentStep > 1 && (
            <p className="back-p-button" onClick={handleBack}>
              ◄ Volver
            </p>
          )}
          {/*El botón va a decir Enviar o Siguiente dependiendo el paso en el que se está*/}
          <button type="submit" className="register-button">
            {currentStep === totalSteps ? 'Enviar' : 'Siguiente'}
          </button>
        </div>
      </form>

      {/* Barra de progreso para indicar el progreso del registro */}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
        />
      </div>
      <p className="register-link">
      ¿Ya tienes cuenta?{' '}
      <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#3d9bff'}}>
        Iniciar sesión
      </span>
    </p>
    </div>
  );
};

export default Registro;
