import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct, fetchAllProductFrontForm, updateProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { Language, RestaurantID } from '../../userInfo';
import { normalizeText, sortStringOfNumber } from '../utils';
import ProductCard from './productCard';
import DialogChangeOrder from './dialogChangeOrder';
import { toast } from 'react-toastify';


function Home() {
    const Text = {...multiLanguageText}[Language].home;
    const location=useLocation();
    const editedProductId = location.state?.editedProductId;
    const productRefs = useRef(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [productsClassified, setProductsClassified] = useState({});
    

    useEffect(() => {
        const fetchData = async ()=>{
            const products_data = await fetchAllProductFrontForm(RestaurantID);
            const categories_data = await fetchAllCategory(RestaurantID);
            const productClassifiedCopy = productsClassified;
            for(const category of categories_data){
                productClassifiedCopy[category.id]=[];
            };
            for (const product of products_data){
                productClassifiedCopy[product.cid].push(product);
            };
            Object.values(productClassifiedCopy).forEach(value=>{
                return value.sort((a, b) => {
                    if (a.favourite === b.favourite) {
                    // 如果 favourite 相同，则按 position 排序
                        return a.position - b.position;
                    }
                    // 否则按 favourite 排序
                    return b.favourite - a.favourite;
                });
            });

            setProductsClassified(productClassifiedCopy)

            const products_sorted = products_data.sort((a, b) => {
                if (a.favourite === b.favourite) {
                // 如果 favourite 相同，则按 position 排序
                    return a.position - b.position;
                }
                // 否则按 favourite 排序
                return b.favourite - a.favourite;
            });

            setProducts(products_sorted);
            setCategories(categories_data);

            const getEle = document.getElementById(editedProductId);
            if (getEle) {
              getEle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };fetchData();
        
    },[editedProductId]);


    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dataToDialog, setDataToDialog] = useState(null);
    const openDialog = (cid) => {
        setDataToDialog(productsClassified[cid])
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const handleSubmit = async(orderedProductFromDialog) => {
        const cid = orderedProductFromDialog[0].cid;
        const productsClassifiedCopy = productsClassified;
        productsClassifiedCopy[cid]=orderedProductFromDialog;
        setProductsClassified(productsClassifiedCopy);
        for (let i=0;i<orderedProductFromDialog.length; i++){
            const positionData = {'id':orderedProductFromDialog[i].id, 'position':i, 'rid':RestaurantID}

            const updated = await updateProduct(positionData)
            if(updated){
                toast.success(Text.addSuccess);
            }else{
                toast.error(Text.addFailed)
            }
        }

        closeDialog();
    };


    return(
        <div className='h-screen overflow-y-hidden'>
            <span className='h-1/6 ml-2 font-sans text-4xl font-bold text-gray-800'>{Text.title}</span> 
            <br/><br/>
            <span className='h-1/6 ml-2 font-sans text-2xl font-bold text-gray-800'>{Text.productList}</span>
            <div className='h-5/6  ml-5 max-h-screen overflow-y-auto overflow-x-hidden pr-5'>
                {Object.values(categories).map((category,index)=>(
                    <div key={category.id} className={` relative flex flex-col justify-center px-3 pt-2 my-3 w-full rounded-lg`} style={{backgroundColor: category.color, color:category.text_color}}>
                        <button onClick={() => openDialog(category.id)} className=' absolute right-5 top-1 px-4 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded '>{Text.modifyOrder}</button>
                        <span className='font-sans text-xl font-bold'>{category.ename || category.lname || category.fname || category.zname || category.name}</span>
                        <span className='text-sm mb-1'>{category.edes || category.ldes || category.fdes || category.zdes || category.des}</span>
                        <div className='mx-2'>
                            {productsClassified[category.id].map((product, index) => {
                                return(
                                    <div key={product.id} id={product.id} className={product.id===editedProductId?`border-4 border-blue-500`:``}>
                                        <ProductCard data={product} />
                                    </div>
                                )
                            })}
                        </div>
                        <br/>
                    </div>
                ))}
                {/* <div className='mb-28'></div> */}
                {isDialogOpen && 
                    <DialogChangeOrder 
                        orderedProductReceived={dataToDialog} 
                        handleSubmit={handleSubmit}
                        handleCancel={closeDialog}
                    />
                }
            </div>
        </div>
    )
}

export default Home