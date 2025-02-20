import './WhatIsItAbout.css'
import { useState} from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

import cellphone_black from '/images/cellphone_black.png';
import cellphone_white from '/images/cellphone_white.png';
import rightArrow_white from '/images/rightArrow_white.png';
import rightArrow_black from '/images/rightArrow_black.png';
import white_computer from '/images/Computer_white.png'
import black_computer from '/images/Computer_black.png'
import white_folder from '/images/folder_white.png'
import black_folder from '/images/folder_black.webp'

const WhatIsAbout = () => {
    const { effectiveMode } = useDarkMode(); // Obtener el estado del modo oscuro

    const cellphoneImgMode = effectiveMode === 'dark' ? cellphone_white : cellphone_black
    const arrowImgMode = effectiveMode === 'dark' ? rightArrow_white : rightArrow_black
    const PCImgMode = effectiveMode === 'dark' ? white_computer : black_computer
    const folderImgMode = effectiveMode === 'dark' ? white_folder : black_folder

    return(
      <div className="WhatIsAbout">
        <h1>Guarda tus cosas</h1>
        <p>Olvidate de pagar suscripciones.</p>
        <p>Esta misma computadora puede funcionar como host para que puedas guardar tus archivos</p>
        <div className="images-container">
          <img src={cellphoneImgMode} alt='Celular'/>
          <img src={arrowImgMode} alt='Arrow' className='arrow-image'/>
          <img src={PCImgMode} alt='Celular'/>
          <img src={folderImgMode} alt='Celular' className="folder-image"/>
          
        </div>
        <hr></hr>

      </div>
    );
};

export default WhatIsAbout;