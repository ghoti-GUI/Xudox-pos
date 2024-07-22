
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
import AdvanceCategoryForm from './advanceCategoryForm';
import { useLocation, useNavigate } from 'react-router-dom';

function AddCategory() {
  // receivedData、productDataReceived = 从home传输过来的data，和data中的product信息
  // normalData、advanceData用于同步两张表单的数据，以便submit
  let location = useLocation();
  const receivedData = location.state;
  const navigate = useNavigate();
  const productDataReceived = receivedData?receivedData.product:null;
  const check = receivedData?receivedData.type==='check':false;
  const edit = receivedData?receivedData.type==='edit':false;

  const TextLanguage = {...multiLanguageText}[Language]
  const Text = TextLanguage.category
  const pageName = Text[check?'check':edit?'edit':'add'].pageName;

  const [img, setImg] = useState(null)
  const [imgUrl, setImgUrl] = useState(null)
  const handleImgSelect = (img)=>{
    setImg(img);
    setImgUrl(null);
  }

  const [color, setColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const handleColorSelect = (color, textColor)=>{
    setColor(color);
    setTextColor(textColor);
  }

  const [advancePage, setAdvancePage] = useState(false)


  const handleCategorySubmit = async(categorydata)=>{

    const categorydataCopy = {...categorydata}
    categorydataCopy['color'] = color;
    categorydataCopy['text_color'] = textColor;
    categorydataCopy['img'] = img;
    categorydataCopy['rid'] = RestaurantID;

    const addSucceed = await addCategory(categorydataCopy)
    if(addSucceed){
      console.log(addSucceed);
      toast.success(Text.add.addSuccess)
      // window.location.reload();
    }else{
      toast.error(Text.add.addFailed)
    }
  }

  // const [normalData, setNormalData] = useState(null);
  // const receiveNormalData = (receivedData)=>{
  //   console.log('receivedData:', receivedData)
  //   setNormalData(receivedData)
  // }

  const handleClickReturn=()=>{
    navigate('/home', {state: { editedCategoryId: productDataReceived.id }})
  }

  const handleDelete=()=>{
    const id = receivedData.id
    console.log(id)
  }


  return (
    <div className='flex flex-col w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
      <span className='-mt-3 mb-3 ml-7 text-3xl'><b>{ pageName }</b></span>
      <div className='flex flex-row w-full '>
        <div className='flex flex-col items-center w-2/12 mt-5'>
          <ImgUploadButton onImgSelect={handleImgSelect}/>
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
          {!advancePage && <CategoryForm 
            onCategorySubmit={handleCategorySubmit} 
            // sendDataToParent={receiveNormalData} 
            // normalData={normalData}
            />
          }
          {advancePage &&
            <AdvanceCategoryForm 
              // handleSubmit={handleSubmit}
              // advanceData={advanceData} 
              // sendDataToParent={sendAdvanceDataToNormal}
              // check={check}
              // edit={edit}
              // productDataReceived={productDataReceived}
            />
          }
        </div>
        <div className='w-2/12'>
            <ColorSelect onColorChange={handleColorSelect}/>
        </div>
      </div>
      {(edit||check)&&
        <button className='absolute right-20 bottom-5 ml-5 btn-bleu' onClick={handleClickReturn}>
          {Text.returnButton}
        </button>
      }
    </div>
  );
}

export default AddCategory;
  