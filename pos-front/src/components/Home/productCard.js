import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter, fetchPrintersById } from '../../service/printer';
import { fetchTVA, fetchTVAById } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber } from '../utils';
import { Language } from '../../userInfo';


const ProductCard = (props)=>{
    const product = props.data;
    const Text = multiLanguageText[Language].home;
    const [soldout, setSoldout] = useState(false);
    const [TVAData, setTVAData] = useState(null);
    const [printers, setPrinters] = useState([])


    const getSupplyTime = ()=>{
        let supplyTime = ''
        if(product.time_supply===1) supplyTime = Text.time_supply[1][0]
        if(product.time_supply===2) supplyTime = Text.time_supply[1][1]
        if(product.time_supply===12) supplyTime = Text.time_supply[1][2]
        return supplyTime
    }

    const getTVAInfo = async(TVA_id) =>{
        const TVAData = await fetchTVAById(TVA_id, Language);
        return TVAData.country+', '+TVAData.tva_value+'%'
    }

    const getPrinters = async(printers_id)=>{
        const printersData = await fetchPrintersById(printers_id)
        // console.log(printersData)
        return printersData
    }

    useEffect(()=>{
        const getInitInfo = async()=>{
            setTVAData(await getTVAInfo(product.TVA_id))
            setPrinters(await getPrinters(product.print_to_where))
        };
        getInitInfo()
    },[])


    const handleSouldout = ()=>{
        setSoldout(!soldout)
    }


    return(
        <div className='grid grid-cols-10 w-full py-2 border-t-2 border-black' style={{backgroundColor: product.color, color:product.text_color}}>
            <img 
                src={'http://localhost:8000'+product.img} 
                alt="product Img" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
                className='col-span-1 w-28 h-24 object-fill border-2 border-black'/>
            <div className='col-span-2 flex flex-col'>
                <p className='mx-1'>{Text.id[0]}: {product.id_Xu}</p>
                <p className='mx-1'>{Text.price[0]}: {product.price}€</p>
                <p className='mx-1'>{Text.price2[0]}: {product.price2}€</p>
                {/* <div className='mx-1 flex'>
                    {Text.soldout[0]}: 
                    <input 
                        type='checkbox' 
                        checked={product.soldout} 
                        readOnly
                        className='ml-1 pointer-events-none'/>
                </div> */}
            </div>
            <div className='col-span-6 flex flex-col'>
                <p className='mx-1'>{Text.TVA[0]}: {TVAData}</p>
                <p className='mx-1'>{Text.bill_content[0]}: {product.bill_content}</p>
                <p className='mx-1'>{Text.kitchen_content[0]}: {product.kitchen_content}</p>
            </div>
            {/* <div className='col-span-2 flex flex-col ml-5'>
                <p className='mx-1'>Printers: </p>
                {printers.map((printer, index)=>(
                    <p key={index} className='mx-2' >&#8226;{printer}</p>
                ))}
            </div> */}

            
            
        </div>
    )
}

export default ProductCard



