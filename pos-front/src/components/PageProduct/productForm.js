
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
// import Cookies from 'js-cookie'
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../valueDefault';
import { fetchNextIdUser, getCsrfToken, checkIdXuExistence, fetchCategory, fetchPrinter, fetchTVA } from './service';
import { sortStringOfNumber } from './utils';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText } from './utils';

function ProductForm() {
  const language = 'English';
  const Text = multiLanguageText[language].product
  const [productdata, setProductData] = useState({
    'id_Xu':'',
    'online_content':'',
    'bill_content':'',
    'kitchen_content':'',
    'bill_des':'', 
    'price':0,
    'price2':0,
    'TVA_country':'',
    'TVA_category':1,
    'time_supply':12,
    'product_type':0,
    'cid':'',
    'print_to_where':0,
  })
  const [printerData, setPrinterData] = useState([
    //{'id':1, 'printer': "cashier's desk", 'checked': false}, 
  ])
  const [TVA, setTVA] = useState({
    //'country':{'21.00': '1', '9.00': '2', '0.00': '3'}, 
  })
  const [TVACountry, setTVACountry] = useState({
    //'country':'country', 
  })
  const [TVACategory, setTVACategory] = useState({
    'A':1,
    'B':2,
    'C':3,
    //'21.00%':1
  })
  const [categoryData, setCategoryData] = useState({
    //'starter':1, 
  });
  const TimeSupplyData = Text.time_supply[1]
  const TimeSuppyKeys = Object.keys(TimeSupplyData)
  const [timeSupply, setTimeSupply] = useState(Text.time_supply[1]) //['lunch', true, 'dinner', true]

  const initData = productdata;
  const requiredFields = ['id_Xu','online_content', 'bill_content', 'kitchen_content', 'bill_des', 'price', 'price2', 'time_supply'];
  const selectFields = {
    'cid': categoryData, 
    'TVA_country': TVACountry,
  };
  const radioField = {
    'product_type':Text.product_type[1], 
    'TVA_category':TVACategory,
  }
  const noInputField = [
    ...Object.keys(requiredFields), 
    ...Object.keys(selectFields), 
    ...Object.keys(radioField),
    'time_supply',
    'print_to_where',
  ]
  const inputField = []
  const numericFields = []

  for (const key in productdata){
    if(!noInputField.includes(key)){
      inputField.push(key)
      if(typeof productdata[key] === 'number'){
        numericFields.push(key)
      }
    }
  }

  const init = useCallback(()=>{
    setProductData(initData)
    setTimeSupply(TimeSupplyData)
    // fetchNextIdUser(setProductData);

    // const printerDataCopy = printerData
    // console.log('printerData:', printerData)
    // printerDataCopy.forEach(element => {
    //   element.checked = false;
    // });
    // console.log('printerDataCopy:', printerDataCopy)
    // setPrinterData(printerDataCopy)
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    init();
    fetchCategory(setCategoryData);
    fetchPrinter(setPrinterData);
    fetchTVA(setTVA, setTVACountry, language);
  },[init]);

  const checkAtlLeastOneField = () => {
    if(!productdata.time_supply){
      alert(Text.time_supply[2]);
      return false
    }
    if(productdata.print_to_where===0){
      alert(Text.print_to_where[2]);
      return false
    }
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if(!checkAtlLeastOneField()){
      return
    }

    try {
      const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
        params:{
          'id_Xu':productdata.id_Xu, 
        }
      });
      if (response.data.existed){
        alert(Text.id_Xu[2])
        return
      } 
    } catch (error) {
      console.error('Error check id_Xu existence:', error);
    };

    const csrfToken = getCsrfToken();
  
    // const nameField = ['ename', 'lname', 'fname', 'zname'];
    // const desField = ['edes', 'ldes', 'fdes'];
    // const AtLeastOneName = nameField.some((key)=>productdata[key].trim() !== '');
    // const AtLeastOneDes = desField.some((key)=>productdata[key].trim() !== '');

    // if (!AtLeastOneName){
    //   event.preventDefault();
    //   alert('Please fill in at least one of the name inputs.');
    //   return;
    // }else if(!AtLeastOneDes){
    //   event.preventDefault();
    //   alert('Please fill in at least one of the description inputs.');
    //   return;
    // }

    axios.post(DefaultUrl+'post/product/', 
      productdata, 
      {
      headers: {
          'X-CSRFToken': csrfToken
      }
    })
    .then(response => {
        console.log(response.data);
        init();
    })
    .catch(error => {
        console.error('There was an error submitting the form!', error);
    });
  };

  const handleChange = (key, value) => {
    setProductData({
      ...productdata,
      [key]: value,
    });
    console.log({
      ...productdata,
      [key]: value,
    });
  };

  const handleChangeID = (key, value) => {
    handleChange(key, normalizeText(value.substring(0, 3)))
  }

  const handleChangeTVACountry = (key, value) => {
    setTVACategory(TVA[value]);
    handleChange(key, value);
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

  const handleChangePrinter = (e) => {
    const printerIdChanged = e.target.name;
    let printerId = '0';
    const printerDataCopy = printerData.map((printer)=>{
      if(printer.id===printerIdChanged){
        if(printer.checked===false) printerId += printer.id;
        return {...printer, 'checked':!printer.checked};
      }else if(printer.checked===true){
        printerId += printer.id
      }
      return printer;
    })
    setPrinterData(printerDataCopy);
    handleChange('print_to_where', parseInt(sortStringOfNumber(printerId)));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-4/5">
      {Object.keys(productdata).map((key)=>(
        <div key={key}>
          {/* {key === 'ename' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the name</div>
          )}
          {key === 'edes' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the description</div>
          )} */}
          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            {key !== 'print_to_where' && (
              <label className="flex bg-white py-2 pl-6 border-r border-borderTable w-1/4 rounded-l-lg">
                  {Text[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className="flex px-2 w-3/4 rounded-r-lg" 
              value={productdata[key]} 
              placeholder={Text[key][1]}
              onChange={(e) => key==='id_Xu'?handleChangeID(key,e.target.value):
                handleChange(key, numericFields.includes(key) ? parseInt(e.target.value):e.target.value)}
              required={requiredFields.includes(key)}/>
            }
              
            {selectFields.hasOwnProperty(key) && 
              <select 
                value={productdata[key]} 
                required
                onChange={(e) => key==='TVA_country'?handleChangeTVACountry(key, e.target.value):handleChange(key, e.target.value)}
                className={`flex w-3/4 px-2 rounded-r-lg ${productdata[key]===''?'text-gray-400':''}`}>
                  <option value="" disabled>{Text[key][1]}</option>
                {Object.entries(selectFields[key]).map(([optionKey, optionValue])=>(
                  <option key={optionKey} value={optionValue} className='text-black'>{optionKey}</option>
                ))}
              </select>
            }

            {radioField.hasOwnProperty(key) &&
              <div className={`grid grid-cols-${Object.keys(radioField[key]).length} w-3/4`}>
                {Object.entries(radioField[key]).map(([fieldKey, fieldValue])=>(
                  <label className='flex bg-white py-2 pl-6 border-r border-borderTable' key={fieldKey}>
                    <input
                      type='radio'
                      value={fieldValue}
                      checked={productdata[key]===fieldValue}
                      onChange={(e) => handleChange(key, parseInt(e.target.value))}
                      className='form-radio'/>
                      {fieldKey}
                  </label>
                ))}
              </div>
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

            {key === 'print_to_where' && (
              <div className='w-full'>
                <label className="flex justify-center bg-white py-2 pl-6 border-r border-borderTable w-full rounded-t-lg">
                  {Text[key][0]} :
                </label>
                <div className='grid grid-cols-4 w-full'>
                  {printerData.map((printer)=>(
                    <div key={printer.id} className={`bg-white py-2 pl-6 border border-borderTable`}>
                      <label className='flex'>
                          <input
                              type="checkbox"
                              name={printer.id}
                              checked={printer.checked}
                              className='mr-2'
                              onChange={(e) => handleChangePrinter(e)}
                          />
                          {printer.id+':'+printer.printer}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {key === 'id_Xu' &&(
              <>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.id_Xu[3][1]}}
                  className='ml-4'/>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.id_Xu[3][2]}}
                  className='ml-4'/>
              </>
            )}
        </div>
      ))}

      <button type="submit" className="rounded bg-blue-500 text-white py-1 ml-3 my-5 w-full">Submit</button>
    </form>
  );
}

export default ProductForm;
