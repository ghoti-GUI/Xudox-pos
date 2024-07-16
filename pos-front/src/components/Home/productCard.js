import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { checkIdXuExistence, deleteProduct, fetchAllProduct, updateProduct} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter, fetchPrintersById } from '../../service/printer';
import { fetchTVA, fetchTVAById } from '../../service/tva';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { normalizeText, sortStringOfNumber } from '../utils';
import { Language, RestaurantID } from '../../userInfo';
import { ReactComponent as Detail } from '../../img/detail.svg';
import { ReactComponent as Edit } from '../../img/edit.svg';
import { ReactComponent as Star } from '../../img/star.svg';
import { ReactComponent as Delete } from '../../img/delete.svg';
import { toast } from 'react-toastify';



const ProductCard = ({data, changeOrder=false})=>{
    const product = data;
    const navigate = useNavigate();
    
    const TextLanguage = {...multiLanguageText}[Language];
    const TextProduct = {...TextLanguage}.product;
    const Text = {...TextLanguage}.home;
    const [soldout, setSoldout] = useState(false);
    const [TVAData, setTVAData] = useState(null);
    // const [printers, setPrinters] = useState([]);


    const getSupplyTime = ()=>{
        let supplyTime = ''
        if(product.time_supply===1) supplyTime = Text.time_supply[1][0]
        if(product.time_supply===2) supplyTime = Text.time_supply[1][1]
        if(product.time_supply===12) supplyTime = Text.time_supply[1][2]
        return supplyTime
    }

    // const getTVAInfo = async(TVA_id) =>{
    //     const TVAData = await fetchTVAById(TVA_id, Language);
    //     return TVAData.country+', '+TVAData.tva_value+'%'
    // }

    // const getPrinters = async(printers_id)=>{
    //     const printersData = await fetchPrintersById(printers_id)
    //     // console.log(printersData)
    //     return printersData
    // }

    useEffect(()=>{
        const getInitInfo = async()=>{
            // setTVAData(await getTVAInfo(product.TVA_id))
            setTVAData(product.tva_country+', '+product.tva_value+'%')
            // setPrinters(await getPrinters(product.print_to_where))
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

    const [isDialogOpen, setIsDialogOpen]=useState(false)
    const handleClickDelete = ()=>{
        setIsDialogOpen(true)
    }

    const DialogConfirmDelete = ()=>{
        return(
            <div className="flex flex-col fixed z-10 inset-0 items-center justify-center w-full h-screen bg-black bg-opacity-50">
                <div className=" w-2/5 h-2/5 bg-white p-6 rounded shadow-lg overflow-y-auto">
                    <h2 className="text-2xl mb-4 text-black">{TextProduct.delete.confirmDelete}</h2>
                    <div className='felx flex-row w-full py-2 border-2 border-black' style={{backgroundColor: product.color, color:product.text_color}}>
                        <p className='mx-1'>{TextProduct.id_Xu[0]}: {product.id_Xu}</p>
                        <p className='mx-1'>{TextProduct.bill_content[0]}: {product.bill_content}</p>
                        <p className='mx-1'>{TextProduct.price[0]}: {product.price}€</p>
                    </div>
                    <div className='flex flex-row w-full items-center justify-center mt-5'>
                        <button
                            className="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                            onClick={()=>handleDelete()}
                        >
                            {TextProduct.delete.deleteButton}
                        </button>
                        <button
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={()=>handleCancelDelete()}
                        >
                            {TextProduct.delete.cancelButton}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleDelete = async()=>{
        setIsDialogOpen(false)
        const deleteSuccess = await deleteProduct(product.id, RestaurantID)
        if(deleteSuccess.success){
            toast.success(TextProduct.delete.deleteSuccess[0] + product.id_Xu + TextProduct.delete.deleteSuccess[1])
            navigate('/');
        }else{
            toast.error(TextProduct.delete.deleteFailed[0] + product.id_Xu + TextProduct.delete.deleteFailed[1])
        }
    }

    const handleCancelDelete=()=>{
        setIsDialogOpen(false);
    }

    const [favourite, setFavourite] = useState(product.favourite)
    const handleClickStar = async()=>{
        const newFavourite = 1-favourite;
        setFavourite(newFavourite);
        const updated = await updateProduct({'id':product.id, 'favourite':newFavourite, 'rid':RestaurantID})
        if(!updated){
            toast.error(Text.changeFavouriteFailed)
        }
    }


    return(
        <div className='grid grid-cols-10 w-full py-2 border-t-2 border-x-2 border-black' style={{backgroundColor: product.color, color:product.text_color}}>
            <img 
                src={'http://localhost:8000'+product.img} 
                alt="no product Img" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
                className='col-span-1 w-28 h-24 ml-1 object-fill border-2 border-black'/>
            <div className='col-span-2 flex flex-col ml-1 -mr-1'>
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
                {!changeOrder && 
                    <div className='flex flex-row justify-center items-center -mr-2'>
                        <div className='flex flex-col w-1/2 justify-center items-center border-x-2 border-black'>
                            <button onClick={handleClickDetail} className='w-5/6 -mt-5 -mb-2 '>
                                <Detail className='w-full'/>
                            </button>
                            <div className='w-5/6 border-b-2 border-black'></div>
                            <button onClick={handleClickEdit} className='w-5/6 -my-2'>
                                <Edit className='w-full'/>
                            </button>
                        </div>
                        <div className='flex w-1/2'>
                            <button onClick={handleClickDelete} className='flex justify-center items-center ml-1 mr-2 w-10 h-10 border-2 border-red-500 bg-white' >
                                <Delete className='w-full'/>
                            </button>
                        </div>
                    </div>
                }
            </div>
            {isDialogOpen && 
                <DialogConfirmDelete/>
            }
            
        </div>
    )
}

export default ProductCard



