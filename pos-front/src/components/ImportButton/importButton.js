import React, { useContext, useState } from 'react';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, lengthContent, lengthDataFull, lengthDataMin } from '../../service/valueDefault';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addProductModelFull } from '../../models/product';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { UserContext } from '../../userInfo';
import { normalizeText, truncateString } from '../utils';
import { categoryModelFull } from '../../models/category';
import { deleteAll, fetchAblistKitchenNonull } from '../../service/commun';
import { addCategory, fetchCategoryByName, fetchCidByCategoryName } from '../../service/category';
import { addProduct } from '../../service/product';
import { exportData } from '../ExportButton/exportFunctions.js';
import { fetchAllPrinter } from '../../service/printer.js';
import { fetchTVAById, fetchTVAIdByCountryCategory } from '../../service/tva.js';
import { notesUnderID } from '../../multiLanguageText/otherText.js';
import ConfirmExportDialog from './confirmExportDialog.js';

const ImportButton = () => {
    const { Language, exportMode } = useContext(UserContext);
    const Text={...multiLanguageText}[Language];
    const TextImport = {...Text}.import;
    const TextImportFailed = {...TextImport}.failedText;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    // const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const onImport = async(onloadEvent, pageEvent)=>{

        const delete_all = await deleteAll();

        const content = onloadEvent.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== ''); // 根据换行符读取每一行，并过滤掉空行

        // let succeed = true;
        setLoading(true);
        let failed = []; // 用来储存所有保存失败的数据
        let idList = []; // 存储出现过的餐楼的id
        let idTakeaway = []; // 存储出现过的外卖的id
        // fetch all printer
        const allprinters_recv = await fetchAllPrinter();
        const ablist_kitchen_nonull_recv_data = await fetchAblistKitchenNonull();
        let ablist_kitchen_nonull_recv = []
        if(ablist_kitchen_nonull_recv_data.succeed){
            ablist_kitchen_nonull_recv = ablist_kitchen_nonull_recv_data.data.map(ablist => ablist.Xu_class)
        }else{
            toast.error(`${TextImportFailed.specialAb}\n${ablist_kitchen_nonull_recv_data.message}`)
        }
        
        // console.log('ablist_kitchen_nonull_recv:', ablist_kitchen_nonull_recv)
        let allprinters;
        if (allprinters_recv && allprinters_recv.length > 0) {
            allprinters = allprinters_recv.map(printer => printer[0]);
        } else {
            allprinters = [];
        }

        let productsData = []
        let categoriesData = []
        let categoryIdName = {} // name:id
        for (const line_origin of lines){
            const line = line_origin.split(';');
            if (line.length < lengthDataMin + 1) {
                failed.push(`'${line_origin}' --- Insufficient data, ${lengthDataMin + 1 - line.length} datas are missing`);
                continue;
            }
            while (line.length < lengthDataFull + 1) {
                line.push(null);
            }
            let [id, name, price, Xu_class, category_name, zname_recv, TVA_category, printer, color, cut_group, custom1, custom2] = line.slice(0, lengthDataFull);

            let dinein_takeaway = 1;
            if (Xu_class === 'meeneem.txt') {
                if (idTakeaway.includes(id)) {
                    failed.push(`'${id};${name}' --- ID duplicated in take-away menu`);
                    continue;
                }
                if (id === '---') {
                    id = 'hyphen3';
                    dinein_takeaway = 2;
                } else {
                    idTakeaway.push(id);
                    dinein_takeaway = 2;
                }
            } else {
                if (idList.includes(id)) {
                    failed.push(`'${id};${name}' --- ID duplicated in dine-in menu`);
                    continue;
                }
                if (id === '---') {
                    id = 'hyphen3';
                    dinein_takeaway = 1;
                } else {
                    idList.push(id);
                    dinein_takeaway = 1;
                }
            }
            
            const [bill_content, exceed_bill] = truncateString(normalizeText(name), lengthContent);
            let zname='', exceed_z=false;
            if(zname_recv && zname_recv.length > 0){
                [zname, exceed_z] = truncateString(normalizeText(zname_recv), lengthContent);
            }else if(ablist_kitchen_nonull_recv.includes(Xu_class)){
                zname = bill_content
            }

            // if(exceed) toast.warning(<span>
            //     Name over the limit:<br/>
            //     ID:{id}<br/>
            //     name:{name}
            // </span>, {position: "bottom-right",autoClose:10000})

            pageEvent.preventDefault();

            let cid = 0; 
            if(categoryIdName.hasOwnProperty(category_name)){
                cid = categoryIdName[category_name]
            }else{
                const responseCategory = await fetchCategoryByName(category_name)
                if(responseCategory.success){
                    categoriesData.push(responseCategory.data)
                    cid = responseCategory.data.id
                    const categoryNameRecv = responseCategory.data.name || responseCategory.data.ename || responseCategory.data.lname || responseCategory.data.fname || responseCategory.data.zname
                    categoryIdName[categoryNameRecv]=cid
                }else{
                    let categoryData = {...categoryModelFull};
                    categoryData.name = category_name;
                    categoryData.Xu_class = Xu_class;
                    const receivedData = await addCategory(categoryData);
                    if (receivedData){
                        cid = receivedData.id
                        const categoryNameRecv = receivedData.name || receivedData.ename || receivedData.lname || receivedData.fname || receivedData.zname
                        categoryIdName[categoryNameRecv]=cid
                    }else{
                        continue
                    }
                }
            }

            // get tva_category
            // let tva_id = null;

            if (TVA_category === 'A') {
                TVA_category = 1;
            } else if (TVA_category === 'B') {
                TVA_category = 2;
            } else if (TVA_category === 'C') {
                TVA_category = 3;
            } else if (TVA_category === 'D') {
                TVA_category = 4;
            } else {
                toast.error(`${TextImportFailed.tva[0]} '${id};${name}'\n${TextImportFailed.tva[1]}: ${TVA_category}`);
                continue;
            }

            // try{
            //     tva_id = await fetchTVAIdByCountryCategory('Belgium', TVA_category)
            // }catch(error){
            //     toast.error(`fetch tva failed for product '${id};${name}'\nThe error '${error}' occurred when getting tva`)
            // }

            let bgColor, textColor;
            if (color) {
                const [r, g, b] = color.split(' ').map(Number);
                bgColor = `rgb(${r},${g},${b})`;
                textColor = setTextColor(r, g, b);
            } else {
                bgColor = 'rgb(255,255,255)';
                textColor = 'rgb(0,0,0)';
            }

            let printerList = Array.from(String(printer));
            let printerListCopy = [...printerList];
            let printerRemoved = '';
            if (printerListCopy.length !== 0) {
                // 检查 printerID 是否都存在，删去不存在的 ID
                printerListCopy.forEach(printerId => {
                    if (!allprinters.includes(Number(printerId))) {
                        printerList = printerList.filter(id => id !== printerId);
                        printerRemoved += printerId;
                    }
                });
            }else{
                toast.error(`${TextImportFailed.printerNull}: '${id};${name}'`)
            }
            if (printerRemoved !== '') {
                failed.push(`${TextImportFailed.printerNoExist}: '${id};${name};${printerRemoved}'`);
            }
            if (printerList.length === 0) {
                printer = 1;
            } else {
                printer = parseInt(printerList.join(''), 10);
            }
            
            if (!cut_group) {
                cut_group = -1;
            }


            const productData = {...addProductModelFull}
            productData.id_Xu = id;
            productData.bill_content = bill_content;
            productData.kitchen_content = zname;
            productData.online_content = name
            productData.TVA_country = 'Belgium';
            productData.TVA_category = TVA_category
            productData.print_to_where = printer;
            productData.color = bgColor;
            productData.text_color = textColor;
            productData.cut_group = cut_group;
            productData.dinein_takeaway = dinein_takeaway
            productData.price = price;
            productData.price2 = price;
            productData.Xu_class = Xu_class;
            productData.cid = cid;
            productData.custom = custom1;
            productData.custom2 = custom2;


            const productAddSucceed = await addProduct(productData)
            if(!productAddSucceed.success) {
                toast.error(Text.product.addFailed);
                // succeedCopy = false;
                failed.push(line+'---add Failed');
            }else{
                productsData.push(productAddSucceed.message)
            }

            // succeed = succeedCopy;
            pageEvent.target.value = '';
        };

        if(failed.length===0){
            toast.success(TextImport.allImportSucceed);
        }else{
            toast.warning(
                <span>
                    <b>{TextImport.failedProduct}:</b>
                    {failed.map((failedProductInfo, index)=>(
                        <span key={index}>
                            <br/><br/>{failedProductInfo}
                        </span>
                    ))}
                </span>, 
                {autoClose:20000});
        }
        setLoading(false);

        // setShowConfirmDialog(true);
        // await exportData(exportMode, productsData, categoriesData)
        navigate('/');
    }

    // const handleConfirm = () => {
    //     // 关闭确认对话框
    //     setShowConfirmDialog(false);
    // };

    const setTextColor = (r, g, b) => {
        // 计算亮度
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
        // 设置阈值
        if (luminance > 128) {
            return 'rgb(0, 0, 0)';
        } else {
            return 'rgb(255, 255, 255)';
        }
    }

    const handleFileSelect = (event)=>{
        const file = event.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = (e)=>onImport(e, event);
            reader.readAsText(file, 'gbk');
        }
    }


    const handleClick=()=>{
        document.getElementById('uploadFile').click();
    }

    const handleCancelLoading=()=>{
        setLoading(false)
    }

    return (
        <div className='flex items-center justify-center w-full mt-4 '>
            <button onClick={handleClick} className='flex items-center justify-center py-1 w-5/6 bg-buttonBleu text-white hover:bg-buttonBleuHover rounded-lg'>
                {TextImport.importButton}
            </button>
            <input
                type='file'
                id='uploadFile'
                style={{ display: 'none' }}
                onChange={(e)=>handleFileSelect(e)}
            />
            {loading &&
                <div className='flex justify-center items-center absolute right-0 top-0 w-screen h-screen bg-black bg-opacity-50 z-10'>
                    <div className='flex flex-col justify-center items-center w-1/2 h-1/2 rounded-3xl bg-white '>
                        <span className=' text-black font-bold'>{TextImport.loading}...</span>
                        {/* <button className='flex justify-center items-center py-1 px-2 mt-5 bg-red-500 text-white rounded-lg' onClick={handleCancelLoading}>
                            Cancel
                        </button> */}
                    </div>
                </div>
            }
            {/* {showConfirmDialog &&
                <ConfirmExportDialog handleConfirm={handleConfirm}/>
            } */}
        </div>
    );
}

export default ImportButton;
