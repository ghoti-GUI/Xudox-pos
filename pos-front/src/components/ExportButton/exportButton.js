import React, { useContext } from 'react';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { UserContext } from '../../userInfo';
import { exportData } from './exportFunctions.js';

const ExportButton = () => {
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].export

    const { exportMode, setExportMode } = useContext(UserContext)

    const handleChangeExportMode = (mode)=>{
        setExportMode(mode);
        localStorage.setItem('ExportMode', mode)
    }

    
    return (
        <div className='mt-4 w-5/6'>
            <div className='flex flex-row items-center justify-center py-1'>
                <button 
                    className={`w-1/2 ${exportMode==='folder'?'bg-buttonBleu':'bg-buttonGray'} rounded-l-lg text-sm`}
                    onClick={()=>handleChangeExportMode('folder')}>
                    {Text.chooseButton[0]}<br/>{Text.chooseButton[1]}
                </button>
                <button 
                    className={`w-1/2 ${exportMode==='zip'?'bg-buttonBleu':'bg-buttonGray'} rounded-r-lg text-sm`}
                    onClick={()=>handleChangeExportMode('zip')}>
                    {Text.chooseButton[0]}<br/>{Text.chooseButton[2]}
                </button>
            </div>
            <button 
                onClick={()=>exportData(exportMode, Language)} 
                className='flex items-center justify-center w-full py-1 mt-3 bg-buttonBleu text-white hover:bg-buttonBleuHover rounded-lg'>
                {Text.exportButton}
            </button>
        </div>
    );
}

export default ExportButton;

