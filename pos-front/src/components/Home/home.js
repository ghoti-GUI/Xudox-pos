import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber } from '../utils';


function Home() {
    const language = 'English'
    const Text = multiLanguageText[language].home
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState({})
    useEffect(() => {
        const fetchData = async ()=>{
            setProducts(await fetchAllProduct())
            setCategories(await fetchAllCategory())
        }
        fetchData()
      },[]);

    return(
        <div>
            Home <br/><br/>
            <h1>Product List</h1>
            <div className='ml-5'>
                {Object.values(categories).map(category=>(
                    <div key={category.id} className={`flex flex-col justify-center mt-1 mx-3 w-full rounded-lg`} style={{backgroundColor: category.color}}>
                        {category.ename || category.lname || category.fname || category.zname}
                        {products.map(product => {
                            if(product.cid===category.id){
                                return(
                                    <div key={product.id} className={`flex flex-row bg-${category}`}>
                                        <h2 className='mx-1'>Online_content: {product.online_content}</h2>
                                        <p className='mx-1'>Description: {product.bill_des}</p>
                                        <p className='mx-1'>Price: ${product.price}</p>
                                    </div>
                                )
                            }
                            return ''
                        })}
                        <br/>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default Home