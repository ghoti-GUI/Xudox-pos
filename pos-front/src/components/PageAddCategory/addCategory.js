
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import CategoryForm from "./categoryForm";
import ImgUploadButton from '../reuseComponent/imgUploadButton';
import ColorSelect from '../reuseComponent/colorSelect';
import { Language, RestaurantID } from '../../userInfo';
import { addCategory } from '../../service/category';
import { toast } from 'react-toastify';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';

function AddCategory() {

  const TextCategory = {...multiLanguageText}[Language].category

  const [img, setImg] = useState(null)
  const handleImgSelect = (img)=>{
    setImg(img)
  }

  const [color, setColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const handleColorSelect = (color, textColor)=>{
    setColor(color);
    setTextColor(textColor);
  }


  const handleCategorySubmit = async(categorydata)=>{

    const categorydataCopy = {...categorydata}
    categorydataCopy['color'] = color;
    categorydataCopy['text_color'] = textColor;
    categorydataCopy['img'] = img;
    categorydataCopy['rid'] = RestaurantID;

    const addSucceed = await addCategory(categorydataCopy)
    if(addSucceed){
      console.log(addSucceed);
      toast.success(TextCategory.addSuccess)
      // window.location.reload();
    }else{
      toast.error(TextCategory.addFailed)
    }
  }

  // const [normalData, setNormalData] = useState(null);
  // const receiveNormalData = (receivedData)=>{
  //   console.log('receivedData:', receivedData)
  //   setNormalData(receivedData)
  // }


  return (
    <div className='flex flex-row w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
      <div className='flex flex-col items-center w-2/12 mt-5'>
        <ImgUploadButton onImgSelect={handleImgSelect}/>
        {/* <button 
          className="flex justify-center items-center px-4 py-2 mt-20 w-2/3 bg-red-500 text-white rounded-lg" 
          onClick={()=>{setAdvancePage(advancePage?false:true)}}>
          {advancePage?Text.returnNormalButton:Text.advanceButton}
        </button> */}
      </div>
      <div className='w-7/12'>
        <CategoryForm 
          onCategorySubmit={handleCategorySubmit} 
          // sendDataToParent={receiveNormalData} 
          // normalData={normalData}
          />
      </div>
      <div className='w-2/12'>
          <ColorSelect onColorChange={handleColorSelect}/>
      </div>
    </div>
  );
}

export default AddCategory;
  