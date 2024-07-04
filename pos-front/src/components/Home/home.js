import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';
import { normalizeText, sortStringOfNumber } from '../utils';
import ProductCard from './productCard';
import DialogChangeOrder from './dialogChangeOrder';


function Home() {
    const location=useLocation();
    const editedProductId = location.state?.editedProductId;
    const productRefs = useRef(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [productsClassified, setProductsClassified] = useState({});

    useEffect(() => {
        const fetchData = async ()=>{
            const products_data = await fetchAllProduct();
            const categories_data = await fetchAllCategory();
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

    
    
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const onDragStart = (index, cid) => {
        setDraggedItemIndex([index, cid]);
        // console.log('onDragStart:', index, cid)
        // console.log(productsClassified[cid])
    };

    const onDragOver = (index, cid) => {
        // const draggedOverItem = products[index];
        console.log('onDragOver:', index, cid)

        // 如果拖动的项目是同一个项目，则不进行任何操作
        if (draggedItemIndex[0] === index || draggedItemIndex[1] !== cid) {
            return;
        };
        

        let items = productsClassified[cid].filter((item, idx) => idx !== draggedItemIndex[0]);

        // 插入被拖动的项目到新的位置
        items.splice(index, 0, productsClassified[cid][draggedItemIndex[0]]);

        let newProductClassified = productsClassified
        newProductClassified[cid] = items;
        // console.log(newProductClassified)

        setProductsClassified(newProductClassified);
        setDraggedItemIndex(index);
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
    };


    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dataToDialog, setDataToDialog] = useState(null);
    const openDialog = (cid) => {
        setDataToDialog(productsClassified[cid])
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const handleSubmit = (orderedProductFromDialog) => {
        const cid = orderedProductFromDialog[0].cid;
        const productsClassifiedCopy = productsClassified;
        productsClassifiedCopy[cid]=orderedProductFromDialog;
        setProductsClassified(productsClassifiedCopy);
        closeDialog();
    };


    return(
        <div className='overflow-y-hidden'>
            <span className='ml-2 font-sans text-4xl font-bold text-gray-800'>Home</span> 
            <br/><br/>
            <span className='ml-2 font-sans text-2xl font-bold text-gray-800'>Product List</span>
            <div className='ml-5 max-h-screen overflow-y-auto overflow-x-hidden pr-5'>
                {Object.values(categories).map((category,index)=>(
                    <div key={category.id} className={`flex flex-col justify-center px-3 pt-2 my-3 w-full rounded-lg`} style={{backgroundColor: category.color, color:category.text_color}}>
                        <span className='font-sans text-xl font-bold'>{category.ename || category.lname || category.fname || category.zname || category.name}</span>
                        <span className='text-sm mb-1'>{category.edes || category.ldes || category.fdes || category.zdes || category.des}</span>
                        <button onClick={() => openDialog(category.id)} className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'>Modify product order</button>
                        <div className='mx-2'>
                            {productsClassified[category.id].map((product, index) => {
                                return(
                                    <div
                                        key={product.id}
                                        id={product.id}
                                        draggable
                                        onDragStart={() => onDragStart(index, category.id)}
                                        onDragOver={() => onDragOver(index, category.id)}
                                        onDragEnd={onDragEnd}
                                        className=''
                                    >
                                        <ProductCard data={product} />
                                    </div>
                                )
                            })}
                        </div>
                        <br/>
                    </div>
                ))}
                <div className='mb-28'></div>
                {isDialogOpen && <DialogChangeOrder orderedProductReceived={dataToDialog} handleSubmit={handleSubmit}/>}
            </div>
        </div>
    )
}

export default Home