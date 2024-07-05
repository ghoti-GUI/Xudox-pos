import React, { useEffect, useState } from 'react';
import { fetchAllProduct } from "../../service/product";
import { fetchAllCategory } from "../../service/category";
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';
import { useSearchParams } from 'react-router-dom';
// import { handleClickExport } from './export';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ExportButton = () => {
    const Text = multiLanguageText[Language].export
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [abList, setAbList] = useState({
        'ab1':'',
        'ab2':'',
        'ab3':'',
        'ab4':'',
        'ab5':'',
        'ab6':'',
        'ab7':'',
        'ab8':'',
        'ab9':'',
        'ab10':'',
        'ab11':'',
        'ab12':'',
        'ab13':'',
        'ab14':'',
    });
    const [zwcdValue, setZwcdValue] = useState('')
    const [HooftNameValue, setHooftNameValue ]= useState([
        'Contents',
        'ab1.txt ', 
        'ab2.txt ', 
        'ab3.txt ', 
        'ab4.txt ', 
        'ab5.txt ', 
        'ab6.txt ', 
        'ab7.txt ', 
        'ab8.txt ', 
        'ab9.txt ', 
        'ab10.txt ', 
        'ab11.txt ', 
        'ab12.txt ', 
        'ab13.txt ', 
        'ab14.txt ', 
    ]);
    useEffect(()=>{
        const fetchData=async()=>{


            const productsRecv = await fetchAllProduct();
            const categoriesRecv = await fetchAllCategory();
            setProducts(productsRecv);
            setCategories(categoriesRecv);
            let abListCopy = abList;
            let zwcdValueCopy = zwcdValue;
            productsRecv.forEach((product, index) => {
                abListCopy[`ab${product.cid}`] += '\n'+formatProductData(product);
                zwcdValueCopy += '\n'+formatKitchenData(product);
            });
            setAbList(abListCopy);
            setZwcdValue(zwcdValueCopy);

            let HooftNameValueCopy = HooftNameValue;
            categoriesRecv.forEach((category, index) => {
                if(HooftNameValueCopy[category.id].length<=9) HooftNameValueCopy[category.id] += category.name||category.ename||category.lname||category.fname||category.zname
            });
            console.log(HooftNameValueCopy)
            for (let i=0; i<HooftNameValueCopy.length; i++){
                if(HooftNameValueCopy[i].length<=9) HooftNameValueCopy[i]+='void';
            }
            setHooftNameValue(HooftNameValueCopy);

        };fetchData();

        
        
        
    },[])

    const formatProductData = (product) => {
        const id_Xu = product.id.toString().padStart(3, ' ');
        const bill_content = product.bill_content+'.'.padEnd(25, ' ');
        const price = product.price;
        return `${id_Xu} ${bill_content} ${price}`;
    };
    
    // const formatCategoryData = (category) => {
    //     const cid = category.id.toString();
    //     const name = category.name;
    //     return `ab${cid}.txt ${name}`;
    // };

    const formatKitchenData = (product) => {
        const id_Xu = product.id.toString().padStart(3, ' ');
        const kitchen_content = product.kitchen_content;
        return `${id_Xu} ${kitchen_content}`;
    };
    
    const exportFileZip = ()=>{
        const zip = new JSZip();

        for (const [key, value] of Object.entries(abList)){
            zip.file(`${key}.txt`, value);
        }
        
        zip.file('zwcd.txt', zwcdValue);
        zip.file('HooftName.txt', HooftNameValue.join('\n'));

        zip.generateAsync({ type: 'blob' }).then((blob) => {
            saveAs(blob, 'abFiles.zip');
        });
    }

    

    return (
        <button onClick={exportFileZip} className='flex items-center justify-center py-1 mt-10 w-5/6 bg-blue-500 text-white rounded hover:bg-blue-700 rounded-lg'>
            {Text}
        </button>
    );
}

export default ExportButton;
