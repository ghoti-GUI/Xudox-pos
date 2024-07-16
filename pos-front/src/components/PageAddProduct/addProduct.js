
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
import { addProduct, checkIdXuExistence, updateProduct } from '../../service/product.js';

function AddProduct() {
  let location = useLocation();
  const receivedData = location.state;
  const navigate = useNavigate();
  const productDataReceived = receivedData?receivedData.product:null;
  const check = receivedData?receivedData.type==='check':false;
  const edit = receivedData?receivedData.type==='edit':false;
  const pageName = {...multiLanguageText}[Language].product[check?'check':edit?'edit':'add'].pageName;

  const TextLanguage = {...multiLanguageText}[Language]
  const Text = {...TextLanguage}.product;

  const [img, setImg] = useState(null)
  const handleImgSelect = (img)=>{
    setImg(img)
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
    if(!edit||(edit&&productDataReceived.id_Xu!==normalData.id_Xu)){
      const existed = await checkIdXuExistence(normalData.id_Xu)
      if (existed){
        toast.error(Text.id_Xu[2]);
        return
      } 
    }

    const mergedProductData = Object.assign({}, advanceData, normalData)

    if(edit){
      mergedProductData['id'] = productDataReceived.id;
    }
    mergedProductData['img'] = img;
    mergedProductData['color'] = color;
    mergedProductData['text_color'] = textColor;
    mergedProductData['rid'] = RestaurantID;

    console.log('mergedProductData:', mergedProductData)

    const submitSucceed = edit? await updateProduct(mergedProductData): await addProduct(mergedProductData);
    if(edit){
      if(submitSucceed){
        toast.success(Text.edit.editSuccess)
        navigate('/home', {state: { editedProductId: productDataReceived.id }})
      }else{
        toast.error(Text.edit.editFailed)
      }
    }else{
      if(submitSucceed){
        toast.success(Text.add.addSuccess)
      }else{
        toast.error(Text.add.addFailed)
      }
    }
  };

  return (
    <div className='flex flex-col w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
      <span className='-mt-3 mb-3 ml-7 text-3xl'><b>{ pageName }</b></span>
      <div className='flex flex-row w-full '>
        <div className='flex flex-col items-center w-2/12 mt-5'>
          <ImgUploadButton onImgSelect={handleImgSelect} check={check} edit={edit} imgReceived={initProductImg} />
          <button 
            className="flex justify-center items-center px-4 py-2 mt-20 w-2/3 bg-red-500 text-white rounded-lg" 
            onClick={()=>{setAdvancePage(advancePage?false:true)}}>
            {advancePage?Text.returnNormalButton:Text.advanceButton}
          </button>
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
              productDataReceived={productDataReceived}/>
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
    </div>
  );
}

export default AddProduct;
  