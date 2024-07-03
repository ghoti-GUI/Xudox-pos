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


function Home() {
    const location=useLocation();
    const editedProductId = location.state?.editedProductId;
    const productRefs = useRef(null);
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState({})
    useEffect(() => {
        const fetchData = async ()=>{
            const ptoducts_data = await fetchAllProduct()
            const products_sorted = ptoducts_data.sort((a, b) => {
                if (a.favourite === b.favourite) {
                // 如果 favourite 相同，则按 position 排序
                    return a.position - b.position;
                }
                // 否则按 favourite 排序
                return b.favourite - a.favourite;
            });
            setProducts(products_sorted)
            setCategories(await fetchAllCategory())

            const getEle = document.getElementById(editedProductId);
            if (getEle) {
              getEle.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };fetchData();
        
      },[editedProductId]);

    return(
        <div className='overflow-y-hidden'>
            <span className='ml-2 font-sans text-4xl font-bold text-gray-800'>Home</span> 
            <br/><br/>
            <span className='ml-2 font-sans text-2xl font-bold text-gray-800'>Product List</span>
            <div className='ml-5 max-h-screen overflow-y-auto overflow-x-hidden pr-5'>
                {Object.values(categories).map(category=>(
                    <div key={category.id} className={`flex flex-col justify-center px-3 pt-2 my-3 w-full rounded-lg`} style={{backgroundColor: category.color, color:category.text_color}}>
                        <span className='font-sans text-xl font-bold'>{category.ename || category.lname || category.fname || category.zname || category.name}</span>
                        <span className='text-sm mb-1'>{category.edes || category.ldes || category.fdes || category.zdes || category.des}</span>
                        <div className='mx-2'>
                            {products.map(product => {
                                if(product.cid===category.id){
                                    return(
                                        <div key={product.id} id={product.id} className={`${editedProductId===product.id? 'border-4 border-blue-500 -mx-1':''}`}>
                                            <ProductCard data={product}/>
                                        </div>
                                    )
                                }
                                return null
                            })}
                        </div>
                        <br/>
                    </div>
                ))}
                <div className='mb-28'></div>
            </div>
        </div>
    )
}

export default Home