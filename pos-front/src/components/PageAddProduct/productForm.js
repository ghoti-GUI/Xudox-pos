
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast} from 'react-toastify';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { addProduct, checkIdXuExistence, fetchProductById_Xu, updateProduct } from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA, fetchTVAById } from '../../service/tva';
import { multiLanguageText } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber, updateCheckboxData, updateObject, truncateString } from '../utils';
import { fetchAllCategoryForProductForm, } from './utils';
import { Language, Country, RestaurantID } from '../../userInfo';
import AdvanceForm from './advanceForm';
import { addProductModelNormal } from '../../models/product';

function ProductForm({ handleSubmit, sendIDToColor, normalData, sendDataToParent, check=false, edit=false, productDataReceived}) {

  const Text = {...multiLanguageText}[Language];
  const TextProduct = Text.product;
  
  const maxIDLength = 3
  const maxPrintContentLength = 25
  const [productdata, setProductData] = useState(normalData||{...addProductModelNormal})
  const initData = {...productdata};
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
  const TimeSupplyData = TextProduct.time_supply[1]; 
  const TimeSuppyKeys = Object.keys(TimeSupplyData); 
  const [timeSupply, setTimeSupply] = useState(TextProduct.time_supply[1]) //['lunch', true, 'dinner', true]

  const requiredFields = ['id_Xu','online_content', 'bill_content', 'kitchen_content', 'price', 'price2', 'time_supply'];
  const selectFields = {
    'cid': categoryData, 
    'TVA_country': TVACountry,
  };
  const radioField = {
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
    if(!check&&!edit){
      let TimeSupplyDataCopy = TimeSupplyData
      for(const key in TimeSupplyData){
        TimeSupplyDataCopy[key]=true
      }
      setTimeSupply(TimeSupplyDataCopy)
    }
    // console.log('TimeSupplyData:', TimeSupplyData)
    // eslint-disable-next-line
  }, [TimeSupplyData]);



  // 当通过sidebar打开页面时，值均为默认值。
  // 当从advance返回时，使用normalData值
  // 当从其他页面进入时，使用productDataReceived值
  useEffect(() => {
    // console.log('normalData:', normalData)
    // console.log('productDataReceived:', productDataReceived)
    init();
    
    const fetchData = async() => {
      if(!normalData){
        if(check || edit){
          setProductData(updateObject(productdata, productDataReceived))
          setSameAsBillContent(productDataReceived.bill_content===productDataReceived.kitchen_content)
          setSameAsPrice(productDataReceived.price===productDataReceived.price2)
        }
      }

      const fetchedPrinter = await fetchPrinter();
      setCategoryData(await fetchAllCategoryForProductForm(RestaurantID));

      if(normalData && !check){
        setPrinterData(updateCheckboxData(fetchedPrinter, normalData.print_to_where));
      }else if (check||edit){
        setPrinterData(updateCheckboxData(fetchedPrinter, productDataReceived.print_to_where));
      }else{
        setPrinterData(fetchedPrinter);
      }

      try{
        const TVAData = await fetchTVA(Language);
        // console.log('TVAData:', TVAData)
        setTVA(TVAData); 
        const TVACountry = {}
        for (const country in TVAData){
          TVACountry[country]=country;
        }
        setTVACountry(TVACountry)

        if( (check || edit) && !normalData ){
          const tvaReceived = await fetchTVAById(productDataReceived.TVA_id, Language)
          console.log(tvaReceived)
          const value = Text.country[tvaReceived.country];
          const updatedProductData = {
            ...productdata,
            'TVA_country': value,
            'TVA_category': tvaReceived.category
          }
          console.log('updatedProductData:', updatedProductData)
          setProductData(updatedProductData)
          setTVACategory(TVAData[value]);
        }else{
          const value = normalData?normalData.TVA_country:Text.country[Country]
          handleChange('TVA_country', value)
          setTVACategory(TVAData[value]);
        }
        
      }catch (error){
        console.error('Error fetching TVA data:', error)
      };
    };fetchData();
  },[check, edit, productDataReceived]);

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

  const [idExisted, setIdExisted] = useState(false);
  const handleChangeID = (key, value) => {
    const [truncatedID, exceed] = truncateString(value, maxIDLength);
    handleChange(key, normalizeText(truncatedID).replace(/\s+/g, ''))
    sendIDToColor(normalizeText(truncatedID).replace(/\s+/g, ''))
  }


  // 如果id重复，让用户选择是否读取数据
  const handleBlurID = async()=>{
    if(productdata.id_Xu.trim() !== ''){
      try {
        const existed = await checkIdXuExistence(productdata.id_Xu)
        if (existed){
          setIdExisted(true);
          const product = await fetchProductById_Xu(productdata.id_Xu);
          toast.warning(
            <>
              <span>{TextProduct.id_Xu[3][3][0]}</span>
              <div className='felx flex-row w-full py-2' style={{backgroundColor: product.color, color:product.text_color}}>
                <p className='mx-1'>{TextProduct.id_Xu[0]}: {product.id_Xu}</p>
                <p className='mx-1'>{TextProduct.bill_content[0]}: {product.bill_content}</p>
                <p className='mx-1'>{TextProduct.price[0]}: {product.price}€</p>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mr-2 rounded"
                  onClick={() => handleClickYes()} // 点击“是”按钮的处理函数
                >
                  {TextProduct.id_Xu[3][3][1]}
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => toast.dismiss()} // 点击“否”按钮的处理函数
                >
                  {TextProduct.id_Xu[3][3][2]}
                </button>
              </div>
            </>, {
              closeOnClick: false,
              autoClose: 7000,
            }
          );
        } else{
          setIdExisted(false);
        }
      } catch (error) {
        console.error('Error check id_Xu existence:', error);
        return
      };
    }
  }

  const handleClickYes = async() => {
    const product = await fetchProductById_Xu(productdata.id_Xu);
    let product_copy = {}
    for (let key in productdata){
      product_copy[key]=product[key]
    }
    const TVA_info = await fetchTVAById(product.TVA_id, Language)
    product_copy.TVA_category = TVA_info.category
    product_copy.TVA_country = TVA_info.country
    setTVACategory(TVA[TVA_info.country]);
    setProductData(product_copy)
    toast.dismiss(); 
  };

  const [sameAsBillContent, setSameAsBillContent] = useState(true)
  const handleChangePrintContent = (key, value)=>{
    const [truncatedContent, exceed] = truncateString(value, maxPrintContentLength);
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

  const handleChangeTimeSupply = (name, checked) => {
    // const { name, checked } = event.target;
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
                  dangerouslySetInnerHTML={{ __html: TextProduct.notesForPrintContent[0]}}
                  className='ml-4'/>
                  <br/>
              </>
          )}

          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            
            {key !== 'print_to_where' && (
              <label className="flex bg-white py-2 pl-6 border-r  w-1/4 rounded-l-lg">
                  {TextProduct[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className="flex px-2 w-3/4 rounded-r-lg bg-white" 
              value={check?productDataReceived[key]:productdata[key]} 
              placeholder={TextProduct[key][1]}
              onChange={(e) => {
                const value = e.target.value;
                if(key==='id_Xu') handleChangeID(key, value)
                else if(key==='bill_content'||key==='kitchen_content') handleChangePrintContent(key, value)
                else if(key==='price'||key==='price2') handleChangePrice(key, value)
                else handleChange(key, value)
              }}
              onBlur={key==='id_Xu'?handleBlurID:null}
              required={requiredFields.includes(key)}
              disabled={check}/>
            }
              
            {selectFields.hasOwnProperty(key) && 
              <select 
                value={check && !['TVA_country', 'TVA_category'].includes(key)?productDataReceived[key]:productdata[key]} 
                onChange={(e) => key==='TVA_country'?handleChangeTVACountry(key, e.target.value):handleChange(key, e.target.value)}
                className={`flex w-3/4 px-2 rounded-r-lg bg-white ${productdata[key]===''&&!check?'text-gray-400':''} ${check?'pointer-events-none':''}`}
                required>
                  <option value="" disabled>{TextProduct[key][1]}</option>
                {Object.entries(selectFields[key]).map(([optionKey, optionValue])=>(
                  <option key={optionKey} value={optionValue} className='text-black'>{optionKey}</option>
                ))}
              </select>
            }
            {radioField.hasOwnProperty(key) &&
              <div className={`grid grid-cols-${key==='TVA_category'?4:2} w-3/4`}>
                {Object.entries(radioField[key]).map(([fieldKey, fieldValue])=>(
                  <label className='flex bg-white py-2 pl-6 border-r ' key={fieldKey}>
                    <input
                      type='radio'
                      value={fieldValue}
                      checked={productdata[key]===fieldValue}
                      onChange={(e) => check?'':handleChange(key, parseInt(e.target.value))}
                      className='form-radio'/>
                      {fieldKey}
                  </label>
                ))}
              </div>
            }

            {key === 'time_supply' && (
              <div className='grid grid-cols-2 w-3/4'>
                {Object.entries(timeSupply).map(([name,checked]) => (
                  <div key={name} className={`bg-white py-2 pl-6 border-r`}>
                    <label className='flex'>
                        <input
                            type="checkbox"
                            name={name}
                            checked={checked}
                            className='mr-2 '
                            onChange={(e) => check?'':handleChangeTimeSupply(e.target.name, e.target.checked)}
                        />
                        {name}
                    </label>
                  </div>
                ))}
              </div>
            )}
 
            {key === 'print_to_where' && (
              <div className='w-full'>
                <label className="flex justify-center bg-white py-2 pl-6 border-r  w-full rounded-t-lg">
                  {TextProduct[key][0]} :
                </label>
                <div className='grid grid-cols-4 w-full'>
                  {printerData.map((printer)=>(
                    <div key={printer.id} className={`bg-white py-2 pl-6 border `}>
                      <label className='flex'>
                          <input
                              type="checkbox"
                              name={printer.id}
                              checked={printer.checked}
                              className={`mr-2`}
                              onChange={(e) => check?'':handleChangePrinter(e.target.name, e.target.checked)}
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
              <div className='ml-4'>
                {idExisted &&
                  <div>
                    <span 
                      className='text-red-600'
                      dangerouslySetInnerHTML={{ __html: TextProduct[key][3][2]}}/>
                    <br/>
                  </div>
                }
                <span 
                  dangerouslySetInnerHTML={{ __html: TextProduct[key][3][0]}}
                  className=''/>
                <br/>
                <span 
                  dangerouslySetInnerHTML={{ __html: TextProduct[key][3][1]}}
                  className=''/>
              </div>
          )}
        </div>
      ))}

      {!check && 
        <button type="submit" className="rounded bg-blue-500 text-white py-1 ml-3 my-5 w-full">{TextProduct.submitButton}</button>
      }
      <div className='mb-10'></div>
    </form>
  );
}

export default ProductForm;
