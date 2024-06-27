
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast} from 'react-toastify';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
// import { checkIdXuExistence} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber, updateCheckboxData } from '../utils';
import { fetchAllCategoryForProductForm, truncateString  } from './utils';
import { Language, Country } from '../../userInfo';
import AdvanceForm from './advanceForm';

function ProductForm({sendIDToColor, img, color, textColor, normalData, advanceData, sendDataToParent}) {
  const Text = multiLanguageText[Language].product
  const maxIDLength = 3
  const maxPrintContentLength = 25
  const [productdata, setProductData] = useState(normalData?normalData:{
    'id_Xu':'',
    'cid':'',
    'bill_content':'',
    'kitchen_content':'',
    'price':'',
    'price2':'',
    'TVA_country':'',
    'TVA_category':1,
    'time_supply':12,
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
  const requiredFields = ['id_Xu','online_content', 'bill_content', 'kitchen_content', 'price', 'price2', 'time_supply'];
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

  const init = useCallback(async ()=>{
    setProductData(initData)
    setTimeSupply(TimeSupplyData)
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    init();
    const fetchData = async() => {
      const fetchedPrinter = await fetchPrinter()
      setCategoryData(await fetchAllCategoryForProductForm())
      setPrinterData(normalData?updateCheckboxData(fetchedPrinter, normalData.print_to_where):fetchedPrinter);
      try{
        const TVAData = await fetchTVA(Language);
        console.log('TVAData:', TVAData)
        setTVA(TVAData); 
        const TVACountry = {}
        for (const country in TVAData){
          TVACountry[country]=country;
        }
        setTVACountry(TVACountry)
        const value = multiLanguageText[Language].country[Country]
        if(!normalData)handleChange('TVA_country', value)
        setTVACategory(TVAData[value]);
      }catch (error){
        console.error('Error fetching TVA data:', error)
      };
    };fetchData();
  },[]);

  const checkAtlLeastOneField = () => {
    if(!productdata.time_supply){
      toast.warning(Text.time_supply[2]);
      return false
    }
    if(productdata.print_to_where===0){
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

    try {
      const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
        params:{
          'id_Xu':productdata.id_Xu, 
        }
      });
      if (response.data.existed){
        toast.error(Text.id_Xu[2])
        return
      } 
    } catch (error) {
      console.error('Error check id_Xu existence:', error);
      return
    };


    const mergedProductData = Object.assign({}, advanceData, productdata)

    mergedProductData['img'] = img
    mergedProductData['color'] = color;
    mergedProductData['text_color'] = textColor;

    const csrfToken = getCsrfToken();

    axios.post(DefaultUrl+'post/product/', 
      mergedProductData,
      // newProductData, 
      {
      headers: {
          'X-CSRFToken': csrfToken, 
          'content-type': 'multipart/form-data', 
      }
    })
    .then(response => {
        toast.success(Text.addSuccess);
        init();
    })
    .catch(error => {
        toast.error(Text.addFailed)
        console.error('There was an error submitting the form!', error);
    });
  };

  const handleChange = (key, value, key2=null) => {
    let updatedProductData = {}
    if(key2){
      updatedProductData = {
        ...productdata,
        [key]: value,
        [key2]: value,
      }
    }else{
      updatedProductData = {
        ...productdata,
        [key]: value,
      }
    }
    setProductData(updatedProductData);
    console.log(updatedProductData);
    sendDataToParent(updatedProductData);
  };

  const handleChangeID = (key, value) => {
    const truncatedID = truncateString(value, maxIDLength)
    handleChange(key, normalizeText(truncatedID))
    sendIDToColor(normalizeText(truncatedID))
  }

  const [sameAsBillContent, setSameAsBillContent] = useState(true)
  const handleChangePrintContent = (key, value)=>{
    const truncatedContent = truncateString(value, maxPrintContentLength);
    if(sameAsBillContent && key==='bill_content'){
      handleChange(key, normalizeText(truncatedContent), 'kitchen_content')
    }else{
      handleChange(key, normalizeText(truncatedContent))
    }
    if(key==='kitchen_content'){
      setSameAsBillContent(false)
    }
  }

  const [sameAsPrice, setSameAsPrice] = useState(true)
  const handleChangePrice = (key, value)=>{
    const normalizedValue = value.normalize('NFD').replace(/[^\d.]/g, "")
    if(sameAsPrice && key==='price'){
      handleChange(key, normalizedValue, 'price2')
    }else{
      handleChange(key, normalizedValue)
    }
    if(key==='price2'){
      setSameAsPrice(false)
    }
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

  const handleChangePrinter = (printerIdChanged, checked) => {
    let printerId = '0';
    const printerDataCopy = printerData.map((printer)=>{
      if(printer.id===printerIdChanged){
        if(printer.checked===false) printerId += printer.id;
        return {...printer, 'checked':checked};
      }else if(printer.checked===true){
        printerId += printer.id
      }
      return printer;
    })
    setPrinterData(printerDataCopy);
    handleChange('print_to_where', parseInt(sortStringOfNumber(printerId)));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {Object.keys(productdata).map((key)=>(
        <div key={key}>
          {/* {key === 'ename' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the name</div>
          )}
          {key === 'edes' && (
            <div className="justify-center mt-2 mx-4">Fill in at least one of the description</div>
          )} */}

          {key==='bill_content' &&(
              <>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.notesForPrintContent[0]}}
                  className='ml-4'/>
                  <br/>
              </>
          )}

          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            
            {key !== 'print_to_where' && (
              <label className="flex bg-white py-2 pl-6 border-r border-borderTable w-1/4 rounded-l-lg">
                {/* {key} */}
                  {Text[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className="flex px-2 w-3/4 rounded-r-lg" 
              value={productdata[key]} 
              placeholder={Text[key][1]}
              onChange={(e) => {
                const value = e.target.value;
                if(key==='id_Xu') handleChangeID(key, value)
                else if(key==='bill_content'||key==='kitchen_content') handleChangePrintContent(key, value)
                else if(key==='price'||key==='price2') handleChangePrice(key, value)
                else handleChange(key, value)
              }}
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
              <div className={`grid grid-cols-${key==='TVA_category'?4:2} w-3/4`}>
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
                  <div key={name} className={`bg-white py-2 pl-6 border-r ${name==='dinner'?'rounded-r-lg':''}`}>
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
                              onChange={(e) => handleChangePrinter(e.target.name, e.target.checked)}
                          />
                          {printer.id+':'+printer.printer}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {key==='id_Xu' &&(
              <>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text[key][3][0]}}
                  className='ml-4'/>
                <br/>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text[key][3][1]}}
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
