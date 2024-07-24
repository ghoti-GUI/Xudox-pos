
import React, { useEffect, useState, useCallback, useParams } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import ProductForm from "./productForm";
import ImgUploadButton from '../reuseComponent/imgUploadButton';
import ColorSelect from '../reuseComponent/colorSelect';
import AdvanceForm from './advanceForm.js';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText.js';
import { Language, RestaurantID } from '../../userInfo';
import { addProduct, checkIdXuExistence, deleteProduct, updateProduct } from '../../service/product.js';
import { addProductModelAdvance, addProductModelNormal } from '../../models/product.js';
import { fetchImgFile } from '../../service/commun.js';
import '../../styles.css'

function AddProduct() {
  // receivedData、productDataReceived = 从home传输过来的data，和data中的product信息
  // normalData、advanceData用于同步两张表单的数据，以便submit
  let location = useLocation();
  const receivedData = location.state;
  const navigate = useNavigate();
  const productDataReceived = receivedData?receivedData.product:null;
  const check = receivedData?receivedData.type==='check':false;
  const edit = receivedData?receivedData.type==='edit':false;
  
  const TextLanguage = {...multiLanguageText}[Language]
  const Text = {...TextLanguage}.product;
  const pageName = Text[check?'check':edit?'edit':'add'].pageName;

  const [img, setImg] = useState(null)
  const [imgUrl, setImgUrl] = useState(null)
  const handleImgSelect = (img)=>{
    setImg(img)
    setImgUrl(null)
  }

  const [initProductImg, setInitProductImg] = useState(null)

  const [color, setColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const handleColorSelect = (color, textColor)=>{
    setColor(color)
    setTextColor(textColor)
  }

  const [productId, setProductId] = useState('');
  const sendProductIDToColor = (productIdReceived)=>{
    setProductId(productIdReceived);
  }

  const [advancePage, setAdvancePage] = useState(false);
  const [advanceData, setAdvanceData] = useState(null);
  const [normalData, setNormalData] = useState(null);
  const sendNormalDataToAdvance = (normalDataReceived)=>{
    setNormalData(normalDataReceived)
    // console.log('nomalData received:', normalDataReceived)
  }
  const sendAdvanceDataToNormal = (advanceDataReceived)=>{
    setAdvanceData(advanceDataReceived)
  }

  useEffect(()=>{
    if(check||edit){
      setColor(productDataReceived.color);
      setTextColor(productDataReceived.text_color);
      setInitProductImg(productDataReceived.img);
    }
  }, [])


  const checkAtlLeastOneField = () => {
    if(!normalData.time_supply){
      toast.warning(Text.time_supply[2]);
      return false
    }
    if(normalData.print_to_where===0){
      toast.warning(Text.print_to_where[2]);
      return false
    }
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if(!checkAtlLeastOneField()){
      return
    }

    // 检查id_Xu是否重复
    // 在添加产品，或者在edit页面且产品id_Xu或dinein_takeaway变了的情况下检查
    if(!edit||(edit&&(productDataReceived.id_Xu!==normalData.id_Xu || productDataReceived.dinein_takeaway!==normalData.dinein_takeaway))){
      for (const dinein_takeaway_nbr of normalData.dinein_takeaway.toString()){
        const existed = await checkIdXuExistence(normalData.id_Xu, dinein_takeaway_nbr)
        if (existed){
          toast.error(Text.id_Xu[2]+`: ${dinein_takeaway_nbr==='1'?Text.dinein_takeaway[1][0]:Text.dinein_takeaway[1][1]}`);
          return
        } 
      }
    }

    const mergedProductData = Object.assign({}, advanceData, normalData)

    if(edit) mergedProductData['id'] = productDataReceived.id;
    mergedProductData['img'] = img;
    if(imgUrl) mergedProductData['imgUrl'] = imgUrl;
    mergedProductData['color'] = color;
    mergedProductData['text_color'] = textColor;
    mergedProductData['rid'] = RestaurantID;

    const dinein_takeaway_data = mergedProductData.dinein_takeaway
    for (const dinein_takeaway_nbr of dinein_takeaway_data.toString()){
      mergedProductData.dinein_takeaway = Number(dinein_takeaway_nbr)

      const submitSucceed = edit? await updateProduct(mergedProductData): await addProduct(mergedProductData);
      if(edit){
        if(submitSucceed.success){
          toast.success(Text.edit.editSuccess)
          navigate('/home', {state: { editedProductId: productDataReceived.id }})
        }else{
          toast.error(Text.edit.editFailed)
        }
      }else{
        if(submitSucceed.success){
          toast.success(Text.add.addSuccess)
        }else{
          toast.error(Text.add.addFailed)
        }
      }
    }
  };

  const handleExistedData = async(existedProductData)=>{
    console.log('existedProductData:', existedProductData)
    let existedNormalData = {}
    for (let key in addProductModelNormal){
      existedNormalData[key]=existedProductData[key]
    }
    setNormalData(existedNormalData)
    let existedAdvanceData = {}
    for (let key in addProductModelAdvance){
      existedAdvanceData[key]=existedProductData[key]
    }
    setAdvanceData(existedAdvanceData)
    const imgUrl = existedProductData.img
    // const imgFile = await fetchImgFile(imgUrl)
    // setImg(imgFile)
    setImgUrl(imgUrl)
    setInitProductImg(imgUrl)
    setColor(existedProductData.color)
    setTextColor(existedProductData.text_color)
    console.log('existedNormalData:', existedNormalData)
  }

  const handleClickReturn=()=>{
    navigate('/home', {state: { editedProductId: productDataReceived.id }})
  }

  const handleDelete=async()=>{
    const id = productDataReceived.id
    try{
      await deleteProduct(id)
      toast.success(Text.delete.deleteSuccess[0] + productDataReceived.id_Xu + Text.delete.deleteSuccess[1])
      navigate('/home')
    }catch(e){
      toast.error(Text.delete.deleteFailed[0] + productDataReceived.id_Xu + Text.delete.deleteFailed[1] + '\nerror:' + e)
    }
    
  }

  return (
    <div className='flex flex-col w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
      <span className='-mt-3 mb-3 ml-7 text-3xl'><b>{ pageName }</b></span>
      <div className='flex flex-row w-full '>
        <div className='flex flex-col items-center w-2/12 mt-5'>
          <ImgUploadButton onImgSelect={handleImgSelect} check={check} edit={edit} imgReceived={initProductImg} />
          <button 
            className="flex justify-center items-center px-4 py-2 mt-20 w-2/3 bg-buttonRed hover:bg-buttonRedHover text-white rounded-lg" 
            onClick={()=>{setAdvancePage(advancePage?false:true)}}>
            {advancePage?Text.returnNormalButton:Text.advanceButton}
          </button>
          {edit &&
            <button className='btn-red mt-64' onClick={handleDelete}>
              {Text.delete.deleteButton}
            </button>
          }
        </div>
        <div className='w-7/12'>
          {!advancePage && 
            <ProductForm 
              handleSubmit={handleSubmit}
              sendIDToColor={sendProductIDToColor} 
              normalData={normalData} 
              sendDataToParent={sendNormalDataToAdvance}
              check={check}
              edit={edit}
              productDataReceived={productDataReceived}
              sendExistedDataToParent={handleExistedData}/>
          }
          {advancePage &&
            <AdvanceForm 
              handleSubmit={handleSubmit}
              advanceData={advanceData} 
              sendDataToParent={sendAdvanceDataToNormal}
              check={check}
              edit={edit}
              productDataReceived={productDataReceived}/>
          }
        </div>
        <div className='w-2/12'>
            <ColorSelect 
              onColorChange={handleColorSelect} 
              Id={productId} 
              advance={advancePage}
              check={check}
              edit={edit}
              colorReceived={color}
              textColorReceived={textColor}/>
        </div>
        
      </div>
      {(edit||check)&&
        <button className='absolute right-20 bottom-5 ml-5 btn-bleu' onClick={handleClickReturn}>
          {TextLanguage.returnButton}
        </button>
      }
    </div>
  );
}

export default AddProduct;
  