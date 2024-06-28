
import React, { useEffect, useState, useCallback } from 'react';
import axios, { all } from 'axios';
import { ToastContainer, toast} from 'react-toastify';
import { getCsrfToken } from '../../service/token';
import { DefaultUrl, CheckIdXuExistenceUrl } from '../../service/valueDefault';
// import { checkIdXuExistence} from '../../service/product';
import { fetchAllCategory } from '../../service/category';
import { fetchPrinter } from '../../service/printer';
import { fetchTVA } from '../../service/tva';
import { multiLanguageText, multiLanguageAllergen } from '../multiLanguageText';
import { normalizeText, sortStringOfNumber, mergeObject, updateCheckboxData, updateObject } from '../utils';
import { fetchAllCategoryForProductForm, truncateString } from './utils';
import { Language, Country } from '../../userInfo';

function AdvanceForm({sendIdToColor, img, color, textColor, normalData, advanceData, sendDataToParent, check=false, edit=false, productDataReceived}) {
  // const [productdataNormal, setProductdataNormal] = useState(productdataNormal)
  const Text = multiLanguageText[Language].productAdvance
  const AllergenText = multiLanguageAllergen[Language]
  const maxIDLength = 3
  const maxPrintContentLength = 25
  const [productdata, setProductData] = useState(advanceData||{
    'id_user':'',
    'online_content':'',
    'online_des':'', 
    'product_type':0,
    'min_nbr':1,
    'discount':'',
    'allergen':'',  //database: '', 'b1g1f', '-10€', '-10%'
    'ename':'',
    'lname':'', 
    'fname':'', 
    'zname':'', 
    'edes':'',
    'ldes':'',
    'fdes':'',
    'stb':0,
    'favourite':0,
  })
  const [allergens, setAllergens] = useState([]) //[{'allergen':'Eggs products', 'checked':false}]
  

  const initData = productdata;
  const requiredFields = [];
  const selectFields = {

  };
  const radioField = {
    'product_type':Text.product_type[1], 
    // 'discount':Text.discount[1], 
  }
  const oneCheckBoxField=['stb','favourite'];
  const noInputField = [
    ...Object.keys(requiredFields), 
    ...Object.keys(selectFields), 
    ...Object.keys(radioField),
    ...oneCheckBoxField, 
    'allergen', 
    'discount', 
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

  useEffect(() => {
    setProductData(advanceData);
    if(!advanceData){
      if(check || edit){
        updateObject(productdata, productDataReceived)
        console.log(productDataReceived)
      }
    }

    init();

    const fetchData = async() => {
    };fetchData()

    const reshapeAllergens = ()=>{
      const reshapedAllergens = AllergenText.map((allergen)=>{
        return {'allergen':allergen, 'checked':false}
      })
      if(advanceData && !check){
        setAllergens(updateCheckboxData(reshapedAllergens, advanceData.allergen));
      }else if (check || edit){
        setAllergens(updateCheckboxData(reshapedAllergens, productDataReceived.allergen));
      }else{
        setAllergens(reshapedAllergens);
      }
    };reshapeAllergens();
    // console.log('useEffect')
  },[check, edit, productDataReceived]);

  const checkAtlLeastOneField = (productdata) => {
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

    console.log()

    const mergedProductData = Object.assign({}, normalData, productdata)

    mergedProductData['img'] = img
    mergedProductData['color'] = color;
    mergedProductData['text_color'] = textColor;

    console.log(mergedProductData)

    if(!checkAtlLeastOneField(mergedProductData)){
      return
    }

    

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
    sendIdToColor(normalizeText(truncatedID))
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

  const handleChangeAllergen = (name, value)=>{
    let allergenChoosed = ''
    const allergensCopy = allergens.map((allergen)=>{
      if(allergen.allergen===name){
        if(allergen.checked===false) allergenChoosed += (allergen.allergen+',');
        return {...allergen, 'checked':value};
      }else if(allergen.checked===true){
        allergenChoosed += (allergen.allergen+',')
      }
      return allergen;
    })
    setAllergens(allergensCopy)
    handleChange('allergen', allergenChoosed)
  }


  const [recordDiscountFixed, setRecordDiscountFixed] = useState('€');
  const [recordDiscountPercentage, setRecordDiscountPercentage] = useState('%')
  const handleChangeDiscount = (type, value)=>{
    if(type === 'fixed'){
      setRecordDiscountFixed(value)
      handleChange('discount', value)
    }else if(type === 'percentage'){
      setRecordDiscountPercentage(value)
      handleChange('discount', value)
    }
  }

  const handleChangeCheckbox = (name, checked)=>{
    const value = checked?1:0
    handleChange(name, value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      <span className='ml-4 text-xl'><b>{Text.advanceButton}</b></span>
      {Object.keys(productdata).map((key)=>(
        <div key={key}>

          <div className="flex flex-row justify-center mt-1 mx-3 w-full">
            {key !== 'allergen' && key !== 'discount' && !oneCheckBoxField.includes(key) && (
              <label className="flex bg-white py-2 pl-3 border-r w-1/3 rounded-l-lg">
                {Text[key][0]} :
              </label>
            )}

            {inputField.includes(key) && 
              <input 
              type={numericFields.includes(key) ? 'number':'text'} name={key} 
              className="flex px-2 w-2/3 rounded-r-lg bg-white" 
              value={check?productDataReceived[key]:productdata[key]} 
              placeholder={Text[key][1]}
              onChange={(e) => {
                const value = e.target.value;
                if(key==='id_Xu') handleChangeID(key, value)
                else if(key==='bill_content'||key==='kitchen_content') handleChangePrintContent(key, value)
                else if(key==='price'||key==='price2') handleChangePrice(key, value)
                else handleChange(key, numericFields.includes(key)?parseInt(value):value)
              }}
              required={requiredFields.includes(key)}
              disabled={check}/>
            }
              
            {selectFields.hasOwnProperty(key) && 
              <select 
                value={productdata[key]} 
                required
                onChange={(e) => handleChange(key, e.target.value)}
                className={`flex w-2/3 px-2 rounded-r-lg ${productdata[key]===''?'text-gray-400':''}`}
                disabled={check}>
                  <option value="" disabled>{Text[key][1]}</option>
                  {Object.entries(selectFields[key]).map(([optionKey, optionValue])=>(
                    <option key={optionKey} value={optionValue} className='text-black'>{optionKey}</option>
                  ))}
              </select>
            }

            {radioField.hasOwnProperty(key) &&
              <div className={`grid grid-cols-${
                  key==='discount'?4:2
                } w-2/3`}>
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

            {key==='discount' && (
              <div className='flex flex-col w-full'>
                  <label className="flex justify-center bg-white py-2 pl-6 border-r w-full rounded-t-lg">
                    {Text[key][0]} :
                  </label>
                  <div className='grid grid-cols-2'>
                    <label className=' bg-white py-2 pl-2 border-r '>
                      <input
                        type='radio'
                        value=''
                        checked={productdata[key]===''}
                        onChange={(e) => check?'':handleChange(key, '')}
                        className='form-radio'/>
                        {Text[key][1][0]}
                    </label>
                    <label className='bg-white py-2 pl-2 border-r '>
                      <input
                        type='radio'
                        value='b1g1f'
                        checked={productdata[key]==='b1g1f'}
                        onChange={(e) => check?'':handleChange(key, 'b1g1f')}
                        className='form-radio'/>
                        {Text[key][1][1]}
                    </label>
                  </div>

                  <div className='flex flex-row w-full'>
                    <label className="flex bg-white py-2 pl-2 border-r w-1/2 ">
                      <input
                        type='radio'
                        value={Text[key][1][2]}
                        checked={productdata[key].includes('€')}
                        onChange={(e) => check?'':handleChange(key, recordDiscountFixed)}
                        className='form-radio'/>
                        {Text[key][1][2]}
                    </label>
                      <input
                        type='text'
                        value={!productdata[key].includes('€')?'':productdata[key]}
                        placeholder={recordDiscountFixed}
                        disabled={!productdata[key].includes('€')||check}
                        onChange={(e) => handleChangeDiscount('fixed', e.target.value)}
                        className='w-1/2 text-right pr-5 bg-white'/>
                  </div>

                  <div className='flex flex-row w-full'>
                    <label className='bg-white py-2 pl-2 border-r w-1/2 '>
                      <input
                        type='radio'
                        value={Text[key][1][3]}
                        checked={productdata[key].includes('%')}
                        onChange={(e) => check?'':handleChange(key, recordDiscountPercentage)}
                        className='form-radio'/>
                        {Text[key][1][3]}
                    </label>
                      <input
                        type='text'
                        value={!productdata[key].includes('%')?'':productdata[key]}
                        placeholder={recordDiscountPercentage}
                        disabled={!productdata[key].includes('%')||check}
                        onChange={(e) => handleChangeDiscount('percentage', e.target.value)}
                        className='w-1/2 text-right pr-5 bg-white'/>
                  </div>
              </div>
            )}

            {key==='allergen'&&(
              <div className='w-full'>
                <label className="flex justify-center bg-white py-2 pl-6 border-r w-full rounded-t-lg">
                  {Text[key][0]} :
                </label>
                <div className='grid grid-cols-3 w-full'>
                  {allergens.map((allergen, index)=>(
                    <div key={index} className={`bg-white py-2 px-2 border`}>
                      <label className='flex items-center'>
                          <input
                              type="checkbox"
                              name={allergen.allergen}
                              checked={allergen.checked}
                              className='mr-2'
                              onChange={(e) => check?'':handleChangeAllergen(e.target.name, e.target.checked)}
                          />
                          <span className=''>{allergen.allergen}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      ))}

      <div className='grid grid-cols-2 w-full ml-3 -mt-1'>
        {oneCheckBoxField.map((key)=>(
          <label key={key} className=' col-span-1 flex bg-white py-2 px-2 border'>
            <span className='mr-2'>{Text[key][0]}</span>
              <input
                  type="checkbox"
                  name={Text[key][0]}
                  checked={productdata[key]===1}
                  className='mr-2'
                  onChange={(e) => check?'':handleChangeCheckbox(key, e.target.checked)}
              />
          </label>
        ))}
      </div>

      {!check && 
        <button type="submit" className="rounded bg-blue-500 text-white py-1 ml-3 my-5 w-full">Submit</button>
      }
      <div className='mb-10'></div>
    </form>
  );
}

export default AdvanceForm;
