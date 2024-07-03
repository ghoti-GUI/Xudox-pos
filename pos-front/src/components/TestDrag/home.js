import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
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
import DraggableProductCard from './draggableProductCard';


function TestDragHome() {
    const [products, setProducts] = useState([
        {'id':1, 'id_Xu':'01', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':2, 'id_Xu':'02', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#B80A0A'}, 
        {'id':3, 'id_Xu':'03', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFFFF'}, 
        {'id':4, 'id_Xu':'04', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':5, 'id_Xu':'05', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':6, 'id_Xu':'06', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':7, 'id_Xu':'07', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':8, 'id_Xu':'08', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
        {'id':9, 'id_Xu':'09', 'price':'1.00', 'price2':1.00, 'TVA_id':5, 'bill_content':'1', 'kitchen_content':'123', 'cid':1, 'color':'#FFFE00'}, 
    ])

    const [categories, setCategories] = useState([
        {'id':1, 'name':'Starter'}
    ])
    // useEffect(() => {
    //     const fetchData = async ()=>{
    //         const ptoducts_data = await fetchAllProduct()
    //         const products_sorted = ptoducts_data.sort((a, b) => {
    //             if (a.favourite === b.favourite) {
    //             // 如果 favourite 相同，则按 position 排序
    //                 return a.position - b.position;
    //             }
    //             // 否则按 favourite 排序
    //             return b.favourite - a.favourite;
    //         });
    //         setProducts(products_sorted)
    //         setCategories(await fetchAllCategory())
    //     }
    //     fetchData()
    // },[]);

    const moveProduct = ((dragIndex, hoverIndex) => {
        const dragProduct = products[dragIndex];
        const updatedProducts = [...products];
        updatedProducts.splice(dragIndex, 1);
        updatedProducts.splice(hoverIndex, 0, dragProduct);
        setProducts(updatedProducts);
        // console.log(updatedProducts);
    });

    return(
        <div className='overflow-y-hidden'>
            <span className='ml-2 font-sans text-4xl font-bold text-gray-800'>Home</span> 
            <br/><br/>
            <span className='ml-2 font-sans text-2xl font-bold text-gray-800'>Product List</span>
            <div className='ml-5 max-h-screen overflow-y-auto overflow-x-hidden pr-5'>
                {Object.values(categories).map(category=>(
                    <div key={category.id} className={`flex flex-col justify-center px-3 pt-2 my-3 mx-3 w-full rounded-lg`} style={{backgroundColor: category.color, color:category.text_color}}>
                        <span className='font-sans text-xl font-bold'>{category.ename || category.lname || category.fname || category.zname || category.name}</span>
                        <span className='text-sm mb-1'>{category.edes || category.ldes || category.fdes || category.zdes || category.des}</span>
                        {products.map((product, index) => {
                            if(product.cid===category.id){
                                return(
                                    <DraggableProductCard
                                        key={product.id}
                                        index={index}
                                        id={product.id}
                                        product={product}
                                        moveProduct={moveProduct}
                                        state={products}
                                />)
                            }
                            return null
                        })}
                        <br/>
                    </div>
                ))}
                <div className='mb-28'></div>
            </div>
        </div>
    )
}

export default TestDragHome

