import React, { useState } from 'react';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, lengthContent } from '../../service/valueDefault';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addProductModelFull } from '../../models/product';
import { multiLanguageText } from '../multiLanguageText';
import { Language, RestaurantID } from '../../userInfo';
import { normalizeText, truncateString } from '../utils';
import { categoryModelFull } from '../../models/category';
import { deleteAll } from '../../service/product';

const ImportButton = () => {

    const Text={...multiLanguageText}[Language];
    const rid = RestaurantID;
    const navigate = useNavigate();


    const addCategory = async(categorydata)=>{
        console.log(1)
        const csrfToken = getCsrfToken();
        // let cid = 0
        try {
            const response = await axios.post(DefaultUrl + 'post/category/',
                categorydata,
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'content-type': 'multipart/form-data',
                    }
                }
            );
            console.log('response.data:', response.data);
            return response.data.id; 
        } catch (error) {
            console.error('There was an error submitting the form!', error);
            return false; 
        }
    }


    const addProduct = async(productData)=>{
        const csrfToken = getCsrfToken();
        try {
            const response = await axios.post(DefaultUrl+'post/product/', 
                productData, 
                {
                    headers: {
                        'X-CSRFToken': csrfToken, 
                        'content-type': 'multipart/form-data', 
                    }
            })
            return true;
        }catch(error){
            console.log(productData)
            toast.error(<span>Import failed <br/>{productData.bill_content}: <br/>{`${error}`}</span>, {position: "bottom-right",autoClose: 10000,});
            console.error('There was an error importing product', error);
            return false;
        };
    }


    const [loading, setLoading] = useState(false);
    const onImport = async(onloadEvent, pageEvent)=>{
        // const file = onloadEvent.target.result;
        // const content = parseCSV(file)

        const delete_all = await deleteAll(rid);
        console.log('delete_all', delete_all);

        const content = onloadEvent.target.result;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        console.log(lines);

        let succeed = true;
        setLoading(true);
        let failed = [];
        let idList = [];
        for (const line of lines){
            let succeedCopy = succeed
            // console.log(line)
            let [id, name, price, Xu_class, category_name] = line.split(';');
            if(!idList.includes(id)) {
                if(id==='---') {
                    id = 'hyphen3';
                }else{
                    idList.push(id);
                }
            }else{
                toast.warning(<span>
                    <b>ID duplicated: {id}</b><br/>
                    product:{line}
                </span>, {position: "bottom-right",autoClose:10000})
                succeed=false;
                failed.push(line+'---ID duplicated');
                continue;
            }
            
            const [bill_content, exceed] = truncateString(normalizeText(name), lengthContent);
            if(exceed) toast.warning(<span>
                Name over the limit:<br/>
                ID:{id}<br/>
                name:{name}
            </span>, {position: "bottom-right",autoClose:10000})

            pageEvent.preventDefault();
            const csrfToken = getCsrfToken();

            let cid = 0; 
            await axios.get(DefaultUrl+'get/cid/by/categoryName/',
                {params:{'category_name':category_name}},
                {
                    headers: {
                        'X-CSRFToken': csrfToken, 
                        'content-type': 'multipart/form-data', 
                    }, 
                }
            )
            .then(response=>{
                cid = response.data.cid;
            })
            .catch(async(error) => {
                // toast.error(<span>category does not exist<br/>try to create category</span>, {autoClose: 10000,});
                console.error('fetch cid failed', error);
                let categoryData = {...categoryModelFull};
                categoryData.name = category_name;
                categoryData.Xu_class = Xu_class;
                categoryData.rid = RestaurantID
                console.log('categoryData:', categoryData);
                cid = await addCategory(categoryData);
            });

            const productData = {...addProductModelFull}
            productData.id_Xu = id;
            productData.bill_content = bill_content;
            productData.kitchen_content = bill_content;
            productData.TVA_country = Text.country.Belgium;
            productData.TVA_category = 1
            productData.price = price;
            productData.price2 = price;
            productData.Xu_class = Xu_class;
            productData.cid = cid;
            productData.rid = RestaurantID;

            console.log(productData)


            if(!await addProduct(productData)) {
                succeedCopy = false;
                failed.push(line+'---add Failed');
            }

            succeed = succeedCopy;
            pageEvent.target.value = '';
        };
        console.log('failed:', failed)
        if(succeed){
            toast.success(`All import succeeded`);
        }else{
            toast.warning(<span>
                <b>Failed products:</b>
                {failed.map((failedProductInfo, index)=>{
                    return(<span id={index}>
                        <br/><br/>{failedProductInfo}
                    </span>)
                })}
            </span>, {autoClose:20000});
        }
        setLoading(false);
        navigate('/');
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
            <button onClick={handleClick} className='flex items-center justify-center py-1 w-5/6 bg-blue-500 text-white hover:bg-blue-700 rounded-lg'>
                Import
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
                        <span className=' text-black font-bold'>Loading...</span>
                        {/* <button className='flex justify-center items-center py-1 px-2 mt-5 bg-red-500 text-white rounded-lg' onClick={handleCancelLoading}>
                            Cancel
                        </button> */}
                    </div>
                </div>
            }
        </div>
    );
}

export default ImportButton;
