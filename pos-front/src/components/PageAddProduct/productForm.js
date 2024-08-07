
import React, { useEffect, useState, useCallback, useContext } from 'react';
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
import { fetchAllCategoryForProductForm, } from './utilsAddProduct';
import { UserContext } from '../../userInfo';
import AdvanceForm from './advanceForm';
import { addProductModelNormal } from '../../models/product';

function ProductForm({ handleSubmit, sendIDToColor, normalData, sendDataToParent, check=false, edit=false, productDataReceived, sendExistedDataToParent}) {
  // const Language = localStorage.getItem('Language') || 'English';
  const { Language } = useContext(UserContext);
  const Country = localStorage.getItem('Country') || 'Belgium'
  const TextLanguage = {...multiLanguageText}[Language];
  const Text = {...TextLanguage}.product;
  
  const maxIDLength = 3
  const maxPrintContentLength = 25
  const [productdata, setProductData] = useState(normalData||{...addProductModelNormal})
  // const initData = {...productdata};
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
    // dine-in:1,
    // take-away:2,
  })
  const [categoryData, setCategoryData] = useState([
    // 'name':name,
    // 'id':category.id,
    // 'Xu_class':category.Xu_class
  ]);

  const [timeSupply, setTimeSupply] = useState({}) //{'lunch':true, 'dinner':true}

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
  const ignoreLabelField = [
    'TVA_country', 
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


  // // 本来用于submit之后重置数据
  // const init = useCallback(async ()=>{
  //   setProductData(initData)
  //   // eslint-disable-next-line
  // }, []);

  // 当通过sidebar打开页面时，值均为默认值。
  // 当从advance返回时，使用normalData值
  // 当从其他页面进入时，使用productDataReceived值

  const updateTimeSupply = (time_supply_nbr, timeSupplyCopy=timeSupply)=>{
    let time_supply_object={}
    Object.keys(timeSupplyCopy).forEach((time, index)=>{
      if(String(time_supply_nbr).includes(String(index+1))){
        time_supply_object[time]=true;
      }else{
        time_supply_object[time]=false;
      }
    })
    setTimeSupply(time_supply_object)
  }


  // productDataReceived 只有check、edit才有
  // normalData 是加载完数据之后保存在父组件，用于submit的数据
  // 除开第一次加载，均使用normalData获取数据
  useEffect(() => {
    const fetchData = async() => {
      // 存在normalData，也就是加载过一次数据后，统一使用储存的数据加载页面
      if(normalData){
        setProductData(normalData)

        //获取所有category
        try{
          const allCategoryData = await fetchAllCategoryForProductForm();
          setCategoryData(allCategoryData);
        }catch(error){
          toast.error(Text.fetchCategoriesFailed+':\n'+error)
        };

        // 设置kitchencontent是否要和billcontent一致
        setSameAsBillContent(normalData.bill_content===normalData.kitchen_content)
        // setSameAsPrice(productDataReceived.price===productDataReceived.price2)

        // 设置TVA选项
        try{
          // fetch tva data from sql
          const TVAData = await fetchTVA();
          setTVA(TVAData); 
          const TVACountry = []
          // 设置国家选项
          for (const country in TVAData){
            TVACountry.push(country)
          }
          setTVACountry(TVACountry)
          setTVACategory(TVAData[Country]);
          // 默认TVA_country为用户数据中的country
          handleChange('TVA_country', Country);
        }catch (error){
          toast.error(Text.fetchTVAFailed+':\n'+error)
        };

        // 设置timeSupply选项
        const timeSupplySelectionData = {
          [Text.time_supply[1][0]]:true,
          [Text.time_supply[1][1]]:true,
        }
        let time_supply_nbr=null
        time_supply_nbr = normalData.time_supply
        if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)

        // 设置printer多选框的值
        try{
          const fetchedPrinter = await fetchPrinter();
          if(fetchedPrinter.length>0){
            setPrinterData(updateCheckboxData(fetchedPrinter, productDataReceived.print_to_where));
          }
        }catch(error){
          toast.error(Text.fetchPrintersFailed+':\n'+error)
        }

        // 设置dinein_takeaway选项
        if(check || edit){
          const DineinTakeawaySelectionCopy = {
            [Text.dinein_takeaway[1][0]]:1,
            [Text.dinein_takeaway[1][1]]:2,
          };
          SetDineinTakeawaySelection(DineinTakeawaySelectionCopy)
        }else{
          const DineinTakeawaySelectionCopy = {
            [Text.dinein_takeaway[1][0]]:1,
            [Text.dinein_takeaway[1][1]]:2,
            [Text.dinein_takeaway[1][2]]:12,
          };
          SetDineinTakeawaySelection(DineinTakeawaySelectionCopy)
        }

      }else{ // 初次加载页面数据读取
        // check和edit界面：
        if(check || edit){
          // 读取接收到的data并储存
          let updatedData = {...productdata}
          updatedData=updateObject(productdata, productDataReceived)

          //获取所有category
          try{
            const allCategoryData = await fetchAllCategoryForProductForm();
            setCategoryData(allCategoryData);
          }catch(error){
            toast.error(Text.fetchCategoriesFailed+':\n'+error)
          }

          // 设置kitchencontent是否要和billcontent一致
          setSameAsBillContent(productDataReceived.bill_content===productDataReceived.kitchen_content)
          // setSameAsPrice(productDataReceived.price===productDataReceived.price2)

          // 设置time supply多选框的值
          const timeSupplySelectionData = {
            [Text.time_supply[1][0]]:true,
            [Text.time_supply[1][1]]:true,
          }
          let time_supply_nbr=null
          time_supply_nbr = productDataReceived.time_supply
          if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)

          // 设置printer多选框的值
          try{
            const fetchedPrinter = await fetchPrinter();
            if(fetchedPrinter.length>0){
              setPrinterData(updateCheckboxData(fetchedPrinter, productDataReceived.print_to_where));
            }
          }catch(error){
            toast.error(Text.fetchPrintersFailed+':\n'+error)
          }

          // 设置TVA选项数据
          try{
            // fetch tva data from sql
            const TVAData = await fetchTVA();
            setTVA(TVAData); 
            const TVACountry = []
            // 设置国家选项
            for (const country in TVAData){
              TVACountry.push(country)
            }
            setTVACountry(TVACountry)
            console.log('TVACountry:', TVACountry)
    
            // 获取tva_id对应的tva并赋值
            try{
              const tvaReceived = await fetchTVAById(productDataReceived.TVA_id);
              const value = tvaReceived.country;
              updatedData.TVA_country = value
              updatedData.TVA_category = tvaReceived.category
              setTVACategory(TVAData[value]);
            }catch(error){
              toast.error(Text.fetchTVAFailed+':\n'+error)
            }
          
            setProductData(updatedData)
            sendDataToParent(updatedData)
            
          }catch (error){
            toast.error(Text.fetchTVAFailed+':\n'+error)
          };

          // 设置dinein_takeaway选项
          const DineinTakeawaySelectionCopy = {
            [Text.dinein_takeaway[1][0]]:1,
            [Text.dinein_takeaway[1][1]]:2,
          };
          SetDineinTakeawaySelection(DineinTakeawaySelectionCopy)
          
        }else{// 添加product页面

          //获取所有category
          try{
            const allCategoryData = await fetchAllCategoryForProductForm();
            setCategoryData(allCategoryData);
          }catch(error){
            toast.error(Text.fetchCategoriesFailed+':\n'+error)
          }

          // 设置printer多选框的值
          try{
            const fetchedPrinter = await fetchPrinter();
            if(fetchedPrinter.length>0){
              setPrinterData(updateCheckboxData(fetchedPrinter, productdata.print_to_where));
            }
          }catch(error){
            toast.error(Text.fetchPrintersFailed+':\n'+error)
          }

          // 设置timeSupply选项
          const timeSupplySelectionData = {
            [Text.time_supply[1][0]]:true,
            [Text.time_supply[1][1]]:true,
          }
          let time_supply_nbr=null
          time_supply_nbr = productdata.time_supply
          if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)

          // 设置dinein_takeaway选项
          const DineinTakeawaySelectionCopy = {
            [Text.dinein_takeaway[1][0]]:1,
            [Text.dinein_takeaway[1][1]]:2,
            [Text.dinein_takeaway[1][2]]:12,
          };
          SetDineinTakeawaySelection(DineinTakeawaySelectionCopy)

          // 设置TVA选项
          try{
            // fetch tva data from sql
            const TVAData = await fetchTVA();
            setTVA(TVAData); 
            const TVACountry = []
            // 设置国家选项
            for (const country in TVAData){
              TVACountry.push(country)
            }
            setTVACountry(TVACountry)
            setTVACategory(TVAData[Country]);
            // 默认TVA_country为用户数据中的country
            handleChange('TVA_country', Country);
          }catch (error){
            toast.error(Text.fetchTVAFailed+':\n'+error)
          };
        }
      }

    };fetchData();
  },[check, edit, Language]);

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
    let key2 = null
    let value2 = null
    if(productdata.dinein_takeaway.toString().includes('1')){
      console.log('change Xu_class')
      key2 = 'Xu_class'
      value2 = category.Xu_class
    }
    handleChange('cid', value, key2, value2)
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
        const existed = await checkIdXuExistence(productdata.id_Xu, productdata.dinein_takeaway)
        if (existed){
          setIdExisted(true);
          const product = await fetchProductById_Xu(productdata.id_Xu, productdata.dinein_takeaway);
          toast.warning(
            <>
              <span>{Text.id_Xu[3][3][0]}</span>
              <div className='felx flex-row w-full py-2' style={{backgroundColor: product.color, color:product.text_color}}>
                <p className='mx-1'>{Text.id_Xu[0]}: {product.id_Xu}</p>
                <p className='mx-1'>{Text.bill_content[0]}: {product.bill_content}</p>
                <p className='mx-1'>{Text.price[0]}: {product.price}€</p>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  className="btn-bleu font-bold mr-2"
                  onClick={() => handleClickYes(product)} // 点击“Yes”按钮的处理函数
                >
                  {Text.id_Xu[3][3][1]}
                </button>
                <button
                  className="btn-gray font-bold"
                  onClick={() => toast.dismiss()} // 点击“No”按钮的处理函数
                >
                  {Text.id_Xu[3][3][2]}
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

  const handleClickYes = async(existedProduct) => {
    // 将product中有的nomalData的值取出来
    let product_copy = {}
    for (let key in productdata){
      product_copy[key]=existedProduct[key]
    }
    const TVA_info = await fetchTVAById(existedProduct.TVA_id)
    product_copy.TVA_category = TVA_info.category
    product_copy.TVA_country = TVA_info.country
    setTVACategory(TVA[TVA_info.country]);
    setProductData(product_copy)
    updateTimeSupply(product_copy.time_supply)
    if(printerData.length>0){
      setPrinterData(updateCheckboxData(printerData, product_copy.print_to_where))
    }
    setSameAsBillContent(existedProduct.bill_content===existedProduct.kitchen_content)
    // setSameAsPrice(existedProduct.price===existedProduct.price2)
    existedProduct.TVA_category = TVA_info.category
    existedProduct.TVA_country = TVA_info.country
    sendExistedDataToParent(existedProduct)
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

  // const [sameAsPrice, setSameAsPrice] = useState(true)
  const handleChangePrice = (key, value)=>{
    const normalizedValue = value.normalize('NFD').replace(/[^\d.]/g, "")
    handleChange(key, normalizedValue)
    // if(sameAsPrice && key==='price'){
    //   handleChange(key, normalizedValue, 'price2')
    // }else{
    //   handleChange(key, normalizedValue)
    // }
    // if(key==='price2'){
    //   setSameAsPrice(false)
    // }
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

  const handleChangeRadioField = (key, value)=>{
    let key2 = null
    let value2 = 'ab1.txt'
    if(key==='dinein_takeaway'){
      if(value===2){
        key2 = 'Xu_class'
        value2 = 'meeneem.txt'
      }else{
        key2 = 'Xu_class'
        for (const category of categoryData){
          if (Number(category.id)===Number(productdata.cid)){
            value2 = category.Xu_class
          }
        }
      }
      
    }
    handleChange(key, value, key2, value2)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {Object.keys(productdata).map((key)=>(
        <div key={key}>

          {key==='bill_content' &&(
              <>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text.notesForPrintContent[0]}}
                  className='ml-4'/>
                  <br/>
              </>
          )}

          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            
            {!ignoreLabelField.includes(key) && (
              <label className="flex bg-white py-2 pl-4 border-r  w-1/4 rounded-l-lg">
                  {Text[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className={`flex px-2 w-3/4 rounded-r-lg  ${key==='Xu_class'?'bg-gray-300 text-gray-600':'bg-white'}`}
              value={check?productDataReceived[key]:productdata[key]} 
              placeholder={Text[key][1]}
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
                  <option value="" disabled>{Text[key][1]}</option>
                  {Object.entries(categoryData).map(([index, category])=>(
                    <option key={index} value={category.id} optionIndex={index} className='text-black'>{category.name}</option>
                  ))}
              </select>
            }

            {/* {key==='TVA_country' && 
              <select 
                value={productdata[key]} 
                onChange={(e) => handleChangeTVACountry(key, e.target.value)}
                className={`flex w-3/4 px-2 rounded-r-lg bg-white ${productdata[key]===''&&!check?'text-gray-400':''} ${check?'pointer-events-none':''}`}
                required>
                  <option value="" disabled>{Text[key][1]}</option>
                  {Object.values(TVACountry).map((country)=>(
                    <option key={country} value={country} className='text-black'>{TextLanguage.country[country]}</option>
                  ))}
              </select>
            } */}


            {radioField.hasOwnProperty(key) &&
              <div className={`grid grid-cols-${key==='TVA_category'?4:3} w-3/4`}>
                {Object.entries(radioField[key]).map(([fieldKey, fieldValue])=>(
                  <label className='flex bg-white py-2 pl-2 border-r ' key={fieldKey}>
                    <input
                      type='radio'
                      value={fieldValue}
                      checked={productdata[key]===fieldValue}
                      onChange={(e) => check?'':handleChangeRadioField(key, parseInt(e.target.value))}
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
                  {Text[key][0]} :
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
                      dangerouslySetInnerHTML={{ __html: Text[key][3][2]}}/>
                    <br/>
                  </div>
                }
                <span 
                  dangerouslySetInnerHTML={{ __html: Text[key][3][0]}}
                  className=''/>
                <br/>
                <span 
                  dangerouslySetInnerHTML={{ __html: Text[key][3][1]}}
                  className=''/>
              </div>
          )}
        </div>
      ))}

      {!check && 
        <button type="submit" className="rounded bg-buttonBleu hover:bg-buttonBleuHover text-white py-1 ml-3 my-5 w-full">{Text.submitButton}</button>
      }
      <div className='mb-10'></div>
    </form>
  );
}

export default ProductForm;
