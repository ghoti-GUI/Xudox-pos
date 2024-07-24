
import React, { useEffect, useState, useCallback } from 'react';
import axios, { all } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast} from 'react-toastify';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
import { addProduct, checkIdXuExistence, fetchProductById_Xu, updateProduct } from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA, fetchTVAById } from '../../service/tva';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { normalizeText, sortStringOfNumber, updateCheckboxData, updateObject, truncateString } from '../utils';
import { fetchAllCategoryForProductForm, } from './utils';
import { Language, Country, RestaurantID } from '../../userInfo';
import AdvanceForm from './advanceForm';
import { addProductModelNormal } from '../../models/product';

function ProductForm({ handleSubmit, sendIDToColor, normalData, sendDataToParent, check=false, edit=false, productDataReceived, sendExistedDataToParent}) {

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
  const [TVACountry, setTVACountry] = useState([
    //'country', 
  ])
  const [TVACategory, setTVACategory] = useState({
    'A':1,
    'B':2,
    'C':3,
    //'21.00%':1
  })

  const [DineinTakeawaySelection, SetDineinTakeawaySelection] = useState({
    [TextProduct.dinein_takeaway[1][0]]:1,
    [TextProduct.dinein_takeaway[1][1]]:2,
  })
  const [categoryData, setCategoryData] = useState([
    // 'name':name,
    // 'id':category.id,
    // 'Xu_class':category.Xu_class
  ]);

  const [timeSupply, setTimeSupply] = useState({...TextProduct.time_supply[1]}) //{'lunch':true, 'dinner':true}

  const requiredFields = ['id_Xu','online_content', 'bill_content', 'kitchen_content', 'price', 'price2', 'time_supply'];
  const selectFields = {
    'cid': categoryData, 
    'TVA_country': TVACountry,
  };
  const radioField = {
    'TVA_category':TVACategory,
    'dinein_takeaway':DineinTakeawaySelection
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
    // eslint-disable-next-line
  }, []);



  // 当通过sidebar打开页面时，值均为默认值。
  // 当从advance返回时，使用normalData值
  // 当从其他页面进入时，使用productDataReceived值

  const updateTimeSupply = (time_supply_nbr)=>{
    let time_supply_object={}
    Object.keys(timeSupply).forEach((time, index)=>{
      if(String(time_supply_nbr).includes(String(index+1))){
        time_supply_object[time]=true;
      }else{
        time_supply_object[time]=false;
      }
    })
    setTimeSupply(time_supply_object)
  }

  useEffect(() => {
    init();
    
    const fetchData = async() => {
      let time_supply_nbr=null
      let updatedData = {...productdata}
      if(!normalData){
        if(check || edit){
          // console.log('update:', updateObject(productdata, productDataReceived))
          updatedData=updateObject(productdata, productDataReceived)
          setSameAsBillContent(productDataReceived.bill_content===productDataReceived.kitchen_content)
          setSameAsPrice(productDataReceived.price===productDataReceived.price2)
          time_supply_nbr = productDataReceived.time_supply
        }
      }else if(normalData){
        time_supply_nbr = normalData.time_supply
      }

      console.log()

      if(time_supply_nbr) updateTimeSupply(time_supply_nbr)


      const fetchedPrinter = await fetchPrinter();
      const allCategoryData = await fetchAllCategoryForProductForm(RestaurantID);
      // console.log(allCategoryData)
      setCategoryData(allCategoryData);

      if(normalData && !check){
        setPrinterData(updateCheckboxData(fetchedPrinter, normalData.print_to_where));
      }else if (check||edit){
        setPrinterData(updateCheckboxData(fetchedPrinter, productDataReceived.print_to_where));
      }else{
        setPrinterData(fetchedPrinter);
      }


      try{
        // fetch tva data from sql
        const TVAData = await fetchTVA();
        setTVA(TVAData); 
        const TVACountry = []
        for (const country in TVAData){
          TVACountry.push(country)
          // TVACountry[country]=country;
        }
        setTVACountry(TVACountry)

        if( (check || edit) && !normalData ){
          const tvaReceived = await fetchTVAById(productDataReceived.TVA_id, Language);
          const value = Text.country[tvaReceived.country];
          updatedData.TVA_country = value
          updatedData.TVA_category = tvaReceived.category
          setTVACategory(TVAData[value]);
        }else{
          const value = normalData?normalData.TVA_country:Text.country[Country]
          updatedData.TVA_country = value
          setTVACategory(TVAData[value]);
        }

        setProductData(updatedData)
        sendDataToParent(updatedData)
        
      }catch (error){
        console.error('Error fetching TVA data:', error)
      };

      // 根据edit/check与否，设置dinein_takeaway的选项，edit/check时，没有both选项
      if(!(check||edit)){
        const DineinTakeawaySelectionCopy = {...DineinTakeawaySelection}
        DineinTakeawaySelectionCopy[TextProduct.dinein_takeaway[1][2]]=12
        SetDineinTakeawaySelection(DineinTakeawaySelectionCopy)
      }

    };fetchData();
  },[check, edit, productDataReceived]);

  const handleChange = (key, value, key2=null, value2=null) => {
    let updatedProductData = {}
    if(key2){
      updatedProductData = {
        ...productdata,
        [key]: value,
        [key2]: value2||value,
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

  const handleChangeCategory = (index, value)=>{
    let category = categoryData[index]
    handleChange('cid', value, 'Xu_class', category.Xu_class)
  }

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
        const existed = await checkIdXuExistence(productdata.id_Xu, productdata.dinein_takeaway, RestaurantID)
        if (existed){
          setIdExisted(true);
          const product = await fetchProductById_Xu(productdata.id_Xu, productdata.dinein_takeaway, RestaurantID);
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
                  className="btn-bleu font-bold mr-2"
                  onClick={() => handleClickYes(product)} // 点击“Yes”按钮的处理函数
                >
                  {TextProduct.id_Xu[3][3][1]}
                </button>
                <button
                  className="btn-gray font-bold"
                  onClick={() => toast.dismiss()} // 点击“No”按钮的处理函数
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

  const handleClickYes = async(product) => {
    // 将product中有的nomalData的值取出来
    let product_copy = {}
    for (let key in productdata){
      product_copy[key]=product[key]
    }
    const TVA_info = await fetchTVAById(product.TVA_id, Language)
    product_copy.TVA_category = TVA_info.category
    product_copy.TVA_country = TVA_info.country
    setTVACategory(TVA[TVA_info.country]);
    setProductData(product_copy)
    updateTimeSupply(product_copy.time_supply)
    setPrinterData(updateCheckboxData(printerData, product_copy.print_to_where))
    setSameAsBillContent(product.bill_content===product.kitchen_content)
    setSameAsPrice(product.price===product.price2)
    product.TVA_category = TVA_info.category
    product.TVA_country = TVA_info.country
    sendExistedDataToParent(product)
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
    let timeSupplyCopy = {...timeSupply};
    timeSupplyCopy[name] = checked;
    let TimeSupplyId = '';
    Object.keys(timeSupplyCopy).forEach((value,index)=>{
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
              <label className="flex bg-white py-2 pl-4 border-r  w-1/4 rounded-l-lg">
                  {TextProduct[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className={`flex px-2 w-3/4 rounded-r-lg  ${key==='Xu_class'?'bg-gray-300 text-gray-600':'bg-white'}`}
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
              disabled={key==='Xu_class'||check}/>
            }

            {key==='cid' && 
              <select 
                value={productdata[key]} 
                onChange={(e) => {
                  const selectedOption = e.target.options[e.target.selectedIndex];
                  const index = selectedOption.getAttribute('optionIndex');
                  handleChangeCategory(index, e.target.value);
                }}
                className={`flex w-3/4 px-2 rounded-r-lg bg-white ${productdata[key]===''&&!check?'text-gray-400':''} ${check?'pointer-events-none':''}`}
                required>
                  <option value="" disabled>{TextProduct[key][1]}</option>
                  {Object.entries(categoryData).map(([index, category])=>(
                    <option key={index} value={category.id} optionIndex={index} className='text-black'>{category.name}</option>
                  ))}
              </select>
            }

            {key==='TVA_country' && 
              <select 
                value={productdata[key]} 
                onChange={(e) => handleChangeTVACountry(key, e.target.value)}
                className={`flex w-3/4 px-2 rounded-r-lg bg-white ${productdata[key]===''&&!check?'text-gray-400':''} ${check?'pointer-events-none':''}`}
                required>
                  <option value="" disabled>{TextProduct[key][1]}</option>
                  {Object.values(TVACountry).map((country)=>(
                    <option key={country} value={country} className='text-black'>{country}</option>
                  ))}
              </select>
            }


            {radioField.hasOwnProperty(key) &&
              <div className={`grid grid-cols-${key==='TVA_category'?4:3} w-3/4`}>
                {Object.entries(radioField[key]).map(([fieldKey, fieldValue])=>(
                  <label className='flex bg-white py-2 pl-2 border-r ' key={fieldKey}>
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
                  <div key={name} className={`bg-white py-2 pl-2 border-r`}>
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
                    <div key={printer.id} className={`bg-white py-2 pl-2 border `}>
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
        <button type="submit" className="rounded bg-buttonBleu hover:bg-buttonBleuHover text-white py-1 ml-3 my-5 w-full">{TextProduct.submitButton}</button>
      }
      <div className='mb-10'></div>
    </form>
  );
}

export default ProductForm;
