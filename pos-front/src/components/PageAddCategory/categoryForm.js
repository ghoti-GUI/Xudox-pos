
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber } from '../utils';
import { Language } from '../../userInfo';
import { categoryModel } from '../../models/category';

function CategoryForm({onCategorySubmit}) {
  const Text = {...multiLanguageText}[Language].category
  const [categorydata, setCategoryData] = useState({...categoryModel})
  const initData = categorydata;

  const TimeSupplyData = Text.time_supply[1]
  const TimeSuppyKeys = Object.keys(TimeSupplyData)
  const [timeSupply, setTimeSupply] = useState(Text.time_supply[1]) //['lunch', true, 'dinner', true]

  const requiredFields = ['name', 'time_supply'];

  const noInputField = [
    ...Object.keys(requiredFields), 
    'time_supply',
    'print_to_where',
  ]
  const inputField = ['id', 'name', 'des']

  const init = useCallback(async ()=>{
    setTimeSupply(TimeSupplyData)
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    init();
  },[init]);

  const checkAtlLeastOneField = () => {
    if(!categorydata.time_supply){
      alert(Text.time_supply[2]);
      return false
    }
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if(!checkAtlLeastOneField()){
      return
    }


    // 修改成检查name是否存在

    // // 检查id是否存在
    // try {
    //   const response = await axios.get(DefaultUrl+'category/check_id_category_existence/', {
    //     params:{
    //       'id_category':categorydata.id, 
    //     }
    //   });
    //   if (response.data.existed){
    //     alert(Text.id[2])
    //     return
    //   } 
    // } catch (error) {
    //   console.error('Error check category id existence:', error);
    // };

    try {
      onCategorySubmit(categorydata)
      // init()
    }catch (error) {
      console.error('Error submit categorydata:', error);
    };
  };

  const handleChange = (key, value) => {
    setCategoryData({
      ...categorydata,
      [key]: value,
    });
    console.log({
      ...categorydata,
      [key]: value,
    });
  };

  const handleChangeID = (key, value) => {
    handleChange(key, normalizeText(value.substring(0, 3)))
  }

  const handleChangeTimeSupply = (event) => {
    const { name, checked } = event.target;
    let timeSupplyCopy = timeSupply;
    timeSupplyCopy[name] = checked;
    let TimeSupplyId = '';
    TimeSuppyKeys.forEach((value,index)=>{
      if (timeSupplyCopy[value]) TimeSupplyId += String(index+1);
    })
    setTimeSupply(timeSupplyCopy);
    handleChange('time_supply', parseInt(TimeSupplyId));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {Object.keys(categorydata).map((key)=>(
        <div key={key}>
          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            <label className="flex bg-white py-2 pl-6 border-r w-1/4 rounded-l-lg">
                {Text[key][0]} :
            </label>

            {inputField.includes(key) && 
              <input 
              type='text' name={key} 
              className="flex px-2 w-3/4 rounded-r-lg" 
              value={categorydata[key]} 
              placeholder={Text[key][1]}
              onChange={(e) => key==='id_Xu'?handleChangeID(key,e.target.value):
                handleChange(key, e.target.value)}
              required={requiredFields.includes(key)}/>
            }

            {key === 'time_supply' && (
              <div className='grid grid-cols-2 w-3/4'>
                {Object.entries(timeSupply).map(([name,checked]) => (
                  <div key={name} className={`bg-white py-2 pl-6 border-r border-borderTable ${name==='dinner'?'rounded-r-lg':''}`}>
                    <label className='flex'>
                        <input
                            type="checkbox"
                            name={name}
                            checked={checked}
                            className='mr-2'
                            onChange={(e) => handleChangeTimeSupply(e)}
                        />
                        {name}
                    </label>
                  </div>
                ))}
              </div>
            )}

          </div>

          {key === 'id' &&(
              <>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.id[3][0]}}
                  className='ml-4'/>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.id[3][1]}}
                  className='ml-4'/>
              </>
            )}
        </div>
      ))}

      <button type="submit" className="rounded bg-blue-500 text-white py-1 ml-3 my-5 w-full">Submit</button>
    </form>
  );
}

export default CategoryForm;
