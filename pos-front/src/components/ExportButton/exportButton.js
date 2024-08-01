import React, { useContext, useEffect, useState } from 'react';
import { fetchAllProduct } from "../../service/product";
import { fetchAllCategory } from "../../service/category";
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { Language, UserContext } from '../../userInfo';
import { useSearchParams } from 'react-router-dom';
// import { handleClickExport } from './export';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { lengthContent, lengthID } from '../../service/valueDefault';
import { fetchAllTVA, fetchTVA } from '../../service/tva.js';
import { createFile, fetchData } from './exportFunctions.js';
import { toast } from 'react-toastify';

const ExportButton = () => {
    const Text = {...multiLanguageText}[Language].export

    const [exportMode, setExportMode] = useState('folder')
    
    const exportFileZip = async()=>{
        try{
            const [
                productsRecv, 
                categoriesRecv, 
                abListCopy, 
                zwcdValueCopy, 
                zwwmValueCopy, 
                riscdValueCopy, 
                riswmValueCopy, 
                colorValueCopy, 
                HooftNameValueCopy
            ] = await fetchData();
            const zip = new JSZip();
            // export ad.txt
            for (const [key, value] of Object.entries(abListCopy)){
                zip.file(`${key}`, value);
            }
            if(zwcdValueCopy.length > 0){
                zip.file('zwcd.txt', zwcdValueCopy);
            }
            if(zwwmValueCopy.length > 0){
                zip.file('zwwm.txt', zwcdValueCopy);
            }
            if(riscdValueCopy.length > 0){
                zip.file('riscd.txt', zwcdValueCopy);
            }
            if(riswmValueCopy.length > 0){
                zip.file('riswm.txt', zwcdValueCopy);
            }
            zip.file('RGB.txt', colorValueCopy);
            
            let valueHooft = ''
            for (const [key, value] of Object.entries(HooftNameValueCopy)){
                valueHooft+=`${key} ${value}\n`;
            }
            zip.file('HooftName.txt', valueHooft);

            zip.generateAsync({ type: 'blob' }).then((blob) => {
                saveAs(blob, 'abFiles.zip');
            });
            
            toast.success('File downloaded successfully!');
        }catch(e){
            console.log('Error downloading file:', e);
            toast.error(`Error downloading file:${e}`);
        }
    }

    const selectDirAndExport = async()=>{
        try{
            const handle = await window.showDirectoryPicker();
            const [
                productsRecv, 
                categoriesRecv, 
                abListCopy, 
                zwcdValueCopy, 
                zwwmValueCopy, 
                riscdValueCopy, 
                riswmValueCopy, 
                colorValueCopy, 
                HooftNameValueCopy
            ] = await fetchData();
            for (const [key, value] of Object.entries(abListCopy)){
                createFile(handle, `${key}`, value)
            }

            if(zwcdValueCopy.length > 0){
                createFile(handle, 'zwcd.txt', zwcdValueCopy)
            }
            if(zwwmValueCopy.length > 0){
                createFile(handle, 'zwwm.txt', zwcdValueCopy)
            }
            if(riscdValueCopy.length > 0){
                createFile(handle, 'riscd.txt', zwcdValueCopy)
            }
            if(riswmValueCopy.length > 0){
                createFile(handle, 'riswm.txt', zwcdValueCopy)
            }
            createFile(handle, 'RGB.txt', colorValueCopy)

            let valueHooft = ''
            for (const [key, value] of Object.entries(HooftNameValueCopy)){
                valueHooft+=`${key} ${value}\n`;
            }
            createFile(handle, 'HooftName.txt', valueHooft)

            toast.success('File downloaded successfully!');
        }catch(e){
            console.log('Error downloading file:', e);
            toast.error(`Error downloading file:${e}`);
        }
    }

    
    return (
        <div className='mt-4 w-5/6'>
            <div className='flex flex-row items-center justify-center py-1'>
                <button 
                    className={`w-1/2 ${exportMode==='folder'?'bg-buttonBleu':'bg-buttonGray'} rounded-l-lg text-sm`}
                    onClick={()=>setExportMode('folder')}>
                    {Text.chooseButton[0]}<br/>{Text.chooseButton[1]}
                </button>
                <button 
                    className={`w-1/2 ${exportMode==='zip'?'bg-buttonBleu':'bg-buttonGray'} rounded-r-lg text-sm`}
                    onClick={()=>setExportMode('zip')}>
                    {Text.chooseButton[0]}<br/>{Text.chooseButton[2]}
                </button>
            </div>
            <button 
                onClick={exportMode==='folder'?selectDirAndExport:exportFileZip} 
                className='flex items-center justify-center w-full py-1 mt-3 bg-buttonBleu text-white hover:bg-buttonBleuHover rounded-lg'>
                {Text.exportButton}
            </button>
        </div>
    );
}

export default ExportButton;

