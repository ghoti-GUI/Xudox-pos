import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, fetchAllProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter, fetchPrintersById } from '../../service/printer';
import { fetchTVA, fetchTVAById } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber } from '../utils';
import { Language } from '../../userInfo';
import { ReactComponent as Detail } from '../../img/detail.svg';
import { ReactComponent as Edit } from '../../img/edit.svg';
import { ReactComponent as Star } from '../../img/star.svg';



const ProductCard = (props)=>{
    const product = props.data;
    const navigate = useNavigate();
    
    const Text = multiLanguageText[Language].home;
    const [soldout, setSoldout] = useState(false);
    const [TVAData, setTVAData] = useState(null);
    const [printers, setPrinters] = useState([]);


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
        getInitInfo();
    },[])


    const handleSouldout = ()=>{
        setSoldout(!soldout)
    }

    const handleClickDetail = ()=>{
        navigate(
            `/checkProduct/${product.id}`, 
            {state:{product:product, 'type':'check'}}
        )
    }

    const handleClickEdit = ()=>{
        navigate(
            `/editProduct/${product.id}`, 
            {state:{product:product, 'type':'edit'}}
        )
    }

    const [favourite, setFavourite] = useState(product.favourite)
    const handleClickStar = ()=>{
        const newFavourite = 1-favourite;
        setFavourite(newFavourite);
        const csrfToken = getCsrfToken();
        axios.post(DefaultUrl+'update/product_by_id/', 
            {'id':product.id, 'favourite':newFavourite},
            {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
            }
          })
          .then(response => {
              console.log('update favourite succeed', response)
          })
          .catch(error => {
              console.error('There was an error submitting the form!', error);
          });
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

            <div className='col-span-1 flex flex-row items-center justify-center mr-1'>
                <button className='w-1/2 mr-1 -mt-3' onClick={handleClickStar}>
                    <Star className={`w-full ${favourite===1?'fill-yellow-400':''}`}/>
                </button>
                <div className='flex flex-col w-1/2 justify-center items-center border-l-2 border-black'>
                    <button onClick={handleClickDetail} className='w-3/4 -mt-5 -mb-2 '>
                        <Detail className='w-full'/>
                    </button>
                    <div className='w-5/6 border-b-2 border-black'></div>
                    <button onClick={handleClickEdit} className='w-3/4 -my-2'>
                        <Edit className='w-full'/>
                    </button>
                </div>
            </div>
            
            
        </div>
    )
}

export default ProductCard



