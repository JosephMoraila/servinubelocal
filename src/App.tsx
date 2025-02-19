import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

import { DarkModeProvider } from '../src/contexts/DarkModeContext';
import { MessageBoxProvider, useMessageBoxContext } from '../src/contexts/MessageBoxContext';
import { useLoadingBar, LoadingBarProvider } from '../src/contexts/LoadingBarContext';

import MessageBox from './components/MessageBox/MessageBox';
import LoadingBar from './components/LoadingProgressBar/LoadingProgressBar';
import Navigation from './components/Navigation/Navigation';
import NavigationFeed from './components/NavigationFeed/NavigationFeed';

import HeroSection from './pages/Hero/Hero';
import NotFound from './pages/NotFound/NotFound';
import About from './pages/About/About';
import WhatIsAbout from './pages/WhatIsItAbout/WhatIsItAbout';

const AppContent: React.FC = () => {
  const { isLoadingBar } = useLoadingBar();
  const {messageMessageBox} = useMessageBoxContext();
  const location = useLocation();
  const navigate = useNavigate();



  // Define las rutas donde Navigation no debe aparecer
  const hideNavigationPaths = ['/register', '/terms', '/privacy', '/waiting', '/feed'];

  // Mostrar NavigationFeed si la ruta actual es /feed
  const isFeedPage = location.pathname.toLowerCase().startsWith('/feed');

  return (
    <div>
      <LoadingBar isLoading={isLoadingBar}/>
      {messageMessageBox && <MessageBox message={messageMessageBox}/> }
      {/* Mostrar NavigationFeed solo en /feed */}
      {isFeedPage && <NavigationFeed />}

      {/* Mostrar Navigation solo si no estamos en una de las rutas específicas */}
      {!hideNavigationPaths.includes(location.pathname.toLowerCase()) && !isFeedPage && <Navigation /> }

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<About />} />
        <Route path="/whatIsItAbout" element={<WhatIsAbout />} />

        {/* Ruta protegida para /feed */}


        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <MessageBoxProvider>
        <LoadingBarProvider>
          <Router>
            <AppContent />
          </Router>
        </LoadingBarProvider>
      </MessageBoxProvider>
    </DarkModeProvider>
  );
};

export default App;
