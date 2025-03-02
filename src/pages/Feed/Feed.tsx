import { useState, useEffect } from 'react';
import { useLoadingBar } from '../../contexts/LoadingBarContext'

const Feed = () => {
  const {setIsLoadingBar} = useLoadingBar();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setError] = useState<string>('');
  const [userName, setUserName] = useState<string>('Cargando...');
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga


  

  return (
    <div className='feed-container'>
      <h1>Feed</h1>
  
    </div>
  );
};

export default Feed;
