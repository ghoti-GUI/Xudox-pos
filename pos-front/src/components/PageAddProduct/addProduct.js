
import React, { useEffect, useState, useCallback, useParams } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import ProductForm from "./productForm";
import ImgUploadButton from '../reuseComponent/imgUploadButton';
import ColorSelect from '../reuseComponent/colorSelect';
import AdvanceForm from './advanceForm.js';
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';

function AddProduct() {
  let location = useLocation();
  const receivedData = location.state;;
  const receivedProductData = receivedData?receivedData.product:null;
  const check = receivedData?receivedData.type==='check':false;
  const edit = receivedData?receivedData.type==='edit':false;
  const pageName = multiLanguageText[Language][check?'check':edit?'edit':'add'].pageName;


  const Text = multiLanguageText[Language].product;

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
  const [normalData, setNormalData] = useState(null)
  const sendNormalDataToAdvance = (normalDataReceived)=>{
    setNormalData(normalDataReceived)
    // console.log('nomalData received:', normalDataReceived)
  }
  const sendAdvanceDataToNormal = (advanceDataReceived)=>{
    setAdvanceData(advanceDataReceived)
  }

  useEffect(()=>{
    if(check||edit){
      setColor(receivedProductData.color);
      setTextColor(receivedProductData.text_color);
      setInitProductImg(receivedProductData.img);
    }
  }, [])

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
              sendIDToColor={sendProductIDToColor} 
              img={img} 
              color={color} 
              textColor={textColor} 
              normalData={normalData} 
              advanceData={advanceData} 
              sendDataToParent={sendNormalDataToAdvance}
              check={check}
              edit={edit}
              productDataReceived={receivedProductData}/>
          }
          {advancePage &&
            <AdvanceForm 
              normalData={normalData} 
              advanceData={advanceData} 
              sendDataToParent={sendAdvanceDataToNormal}
              check={check}
              edit={edit}
              productDataReceived={receivedProductData}/>
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
  