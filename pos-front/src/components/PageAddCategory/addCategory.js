
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import CategoryForm from "./categoryForm";
import ImgUploadButton from '../reuseComponent/imgUploadButton';
import ColorSelect from '../reuseComponent/colorSelect';
import { RestaurantID } from '../../userInfo';

function AddCategory() {

  const [img, setImg] = useState(null)
  const handleImgSelect = (img)=>{
    setImg(img)
  }

  const [color, setColor] = useState('');
  const handleColorSelect = (color)=>{
    setColor(color);
  }

  const handleCategorySubmit = (categorydata)=>{

    categorydata['color'] = color;
    categorydata['img'] = img;
    categorydata['rid'] = RestaurantID;

    const csrfToken = getCsrfToken();

    axios.post(DefaultUrl+'post/category/', 
      categorydata,
      // newProductData, 
      {
      headers: {
          'X-CSRFToken': csrfToken, 
          'content-type': 'multipart/form-data', 
      }
    })
    .then(response => {
        console.log(response.data);
        window.location.reload();
    })
    .catch(error => {
        console.error('There was an error submitting the form!', error);
    });
  }


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
        <CategoryForm onCategorySubmit={handleCategorySubmit}/>
      </div>
      <div className='w-2/12'>
          <ColorSelect onColorChange={handleColorSelect}/>
      </div>
    </div>
  );
}

export default AddCategory;
  