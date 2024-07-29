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

const ExportButton = () => {
    const Text = {...multiLanguageText}[Language].export

    const [exportMode, setExportMode] = useState('folder')
    
    const exportFileZip = async()=>{

        const [productsRecv, categoriesRecv, abListCopy, zwcdValueCopy, HooftNameValueCopy] = await fetchData();
        const zip = new JSZip();

        // export adn.txt
        for (const [key, value] of Object.entries(abListCopy)){
            zip.file(`${key}`, value);
        }
        
        zip.file('zwcd.txt', zwcdValueCopy);


        let valueHooft = 'Contents\n'
        for (const [key, value] of Object.entries(HooftNameValueCopy)){
            valueHooft+=`${key}${value}\n`;
        }
        zip.file('HooftName.txt', valueHooft);

        zip.generateAsync({ type: 'blob' }).then((blob) => {
            saveAs(blob, 'abFiles.zip');
        });
    }

    const selectDirAndExport = async()=>{
        try{
            const handle = await window.showDirectoryPicker();
            const [productsRecv, categoriesRecv, abListCopy, zwcdValueCopy, HooftNameValueCopy] = await fetchData();
            for (const [key, value] of Object.entries(abListCopy)){
                createFile(handle, `${key}`, value)
            }
            createFile(handle, 'zwcd.txt', zwcdValueCopy)

            let valueHooft = 'Contents\n'
            for (const [key, value] of Object.entries(HooftNameValueCopy)){
                valueHooft+=`${key}${value}\n`;
            }
            createFile(handle, 'HooftName.txt', valueHooft)


            alert('File downloaded successfully!');
        }catch(e){
            console.error('Error downloading file:', e);
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

const initAbList = {
    'ab1.txt':'',
    'ab2.txt':'',
    'ab3.txt':'',
    'ab4.txt':'',
    'ab5.txt':'',
    'ab6.txt':'',
    'ab7.txt':'',
    'ab8.txt':'',
    'ab9.txt':'',
    'ab10.txt':'',
    'ab11.txt':'',
    'ab12.txt':'',
    'ab13.txt':'',
    'ab14.txt':'',
    'met.txt':'',
};
const initZwcdValue = ''
const initHooftNameValue = {
    'ab1.txt':'',
    'ab2.txt':'',
    'ab3.txt':'',
    'ab4.txt':'',
    'ab5.txt':'',
    'ab6.txt':'',
    'ab7.txt':'',
    'ab8.txt':'',
    'ab9.txt':'',
    'ab10.txt':'',
    'ab11.txt':'',
    'ab12.txt':'',
    'ab13.txt':'',
    'ab14.txt':'',
};

const fetchData=async(fetch=true, productsData=null, categoriesData=null)=>{

    const productsRecv = fetch?await fetchAllProduct():productsData;
    const categoriesRecv = fetch?await fetchAllCategory():categoriesData;
    const tvaRecv = await fetchAllTVA();
    console.log('tvaRecv:', tvaRecv)
    let abListCopy = { ...initAbList };
    let zwcdValueCopy = initZwcdValue;
    

    productsRecv.forEach((product, index) => {
        const Xu_class = product.Xu_class
        if(!Object.keys(abListCopy).includes(Xu_class)){
            abListCopy[Xu_class]='';
        }
        abListCopy[product.Xu_class] += formatProductData(product, tvaRecv)+'\n';
        zwcdValueCopy += formatKitchenData(product)+'\n';
    });

    let HooftNameValueCopy = {...initHooftNameValue};
    categoriesRecv.forEach((category, index) => {
        if(category.Xu_class!=='met.txt'){
            const name = category.name||category.ename||category.lname||category.fname||category.zname;
            if(!Object.keys(HooftNameValueCopy).includes(category.Xu_class)){
                HooftNameValueCopy[category.Xu_class] = '';
            }
            HooftNameValueCopy[category.Xu_class] += ' '+name;
        }
    });

    // 给HooftName添加void
    for(let [key, value] of Object.entries(HooftNameValueCopy)){
        if(!value) HooftNameValueCopy[key]+=' void';
    };
    console.log(HooftNameValueCopy)
    return [productsRecv, categoriesRecv, abListCopy, zwcdValueCopy, HooftNameValueCopy]

};

const formatProductData = (product, tva_list) => {
    const id_XuRecv = product.id_Xu.toString();
    const id_Xu = id_XuRecv==='hyphen3'?'---':id_XuRecv.padStart(lengthID, ' ');
    const bill_content = product.bill_content+'.'.padEnd(lengthContent-product.bill_content.length, ' ');
    const price = product.price;
    const tva = tva_list.find(tva => tva.id === product.TVA_id)
    let tva_category = 'A';
    if(tva){
        switch (tva.category){
            case 1:
                tva_category = 'A';
                break;
            case 2:
                tva_category = 'B';
                break;
            case 3:
                tva_category = 'C';
                break;
            case 4:
                tva_category = 'D';
                break;
            default:
                tva_category = 'A';
        }
    }
    return `${id_Xu} ${bill_content} ${price} ${tva_category}`;
};

const formatKitchenData = (product) => {
    const id_Xu = product.id_Xu.toString().padStart(lengthID, ' ');
    const kitchen_content = product.kitchen_content;
    return `${id_Xu} ${kitchen_content}`;
};

const createFile = async(handle, name, value)=>{
    const newFileHandle = await handle.getFileHandle(name, { create: true });
    const writable = await newFileHandle.createWritable();
    await writable.write(value);
    await writable.close();
}


export const exportFileAfterImport = async(productsData, categoriesData)=>{
    console.log('exporting')
    try{
        const handle = await window.showDirectoryPicker();
        const [productsRecv, categoriesRecv, abListCopy, zwcdValueCopy, HooftNameValueCopy] = await fetchData(false, productsData, categoriesData);
        for (const [key, value] of Object.entries(abListCopy)){
            createFile(handle, `${key}`, value)
        }
        createFile(handle, 'zwcd.txt', zwcdValueCopy)

        let valueHooft = 'Contents\n'
        for (const [key, value] of Object.entries(HooftNameValueCopy)){
            valueHooft+=`${key}${value}\n`;
        }
        createFile(handle, 'HooftName.txt', valueHooft)

        alert('File downloaded successfully!');
    }catch(e){
        console.error('Error downloading file:', e);
    }
}
