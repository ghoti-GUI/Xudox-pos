import React, { useEffect, useState, useContext } from 'react';
import { multiLanguageText, multiLanguageAllergen } from '../../multiLanguageText/multiLanguageText';
import { normalizeText, updateCheckboxData, updateObject, truncateString } from '../utils';
import { Country, UserContext } from '../../userInfo';
import { addProductModelAdvance } from '../../models/product';

function AdvanceForm({handleSubmit, advanceData, sendDataToParent, check=false, edit=false, productDataReceived}) {
    // const [productdataNormal, setProductdataNormal] = useState(productdataNormal)
    // const Language = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].productAdvance
    const AllergenText = multiLanguageAllergen[Language]
    const maxIDLength = 3
    const maxPrintContentLength = 25
    const [productdata, setProductData] = useState(advanceData||{...addProductModelAdvance})
    const [allergens, setAllergens] = useState([]) //[{'allergen':'Eggs products', 'checked':false}]
  

    const initData = productdata;
    const requiredFields = [];
    const selectFields = {

    };
    const radioField = {
        'product_type':Text.product_type[1], 
    // 'discount':Text.discount[1], 
    }
    const oneCheckBoxField=['stb','favourite', 'soldout'];
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


    useEffect(() => {
        // 初始化数据
        let discountRecv=null
        if(advanceData){
            setProductData(advanceData);
            discountRecv = advanceData.discount
      
        }else if(!advanceData){
            if(check || edit){
                const updatedData = updateObject(productdata, productDataReceived)
                setProductData(updatedData)
                sendDataToParent(updatedData)
                discountRecv = productDataReceived.discount
            }
        }

        // 当check或edit时（有数据传入），设置打折记录recordDiscount
        if(discountRecv){
            if(discountRecv.includes('€')){
                setRecordDiscountFixed(discountRecv)
            }else if(discountRecv.includes('%')){
                setRecordDiscountPercentage(discountRecv)
            }
        }
    

        const fetchData = async() => {
        };fetchData()

        const reshapeAllergens = ()=>{
            const reshapedAllergens = Object.entries(AllergenText).map(([allergen, allergenText])=>{
                return {'allergen':allergen, 'text':allergenText, 'checked':false}
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
        const [truncatedID, exceed] = truncateString(value, maxIDLength)
        handleChange(key, normalizeText(truncatedID))
    }

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

    // 打折记录，用于记录用户填入过的打折数据，以方便切换打折模式
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
                            value={(check?productDataReceived[key]:productdata[key])||''} 
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
                                            checked={productdata[key]==='' || !productdata[key]}
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
                                            checked={productdata[key]?.includes('€')}
                                            onChange={(e) => check?'':handleChange(key, recordDiscountFixed)}
                                            className='form-radio'/>
                                        {Text[key][1][2]}
                                    </label>
                                    <input
                                        type='text'
                                        value={!productdata[key]?.includes('€')?'':productdata[key]}
                                        placeholder={recordDiscountFixed}
                                        disabled={!productdata[key]?.includes('€')||check}
                                        onChange={(e) => handleChangeDiscount('fixed', e.target.value)}
                                        className='w-1/2 text-right pr-5 bg-white'/>
                                </div>

                                <div className='flex flex-row w-full'>
                                    <label className='bg-white py-2 pl-2 border-r w-1/2 '>
                                        <input
                                            type='radio'
                                            value={Text[key][1][3]}
                                            checked={productdata[key]?.includes('%')}
                                            onChange={(e) => check?'':handleChange(key, recordDiscountPercentage)}
                                            className='form-radio'/>
                                        {Text[key][1][3]}
                                    </label>
                                    <input
                                        type='text'
                                        value={!productdata[key]?.includes('%')?'':productdata[key]}
                                        placeholder={recordDiscountPercentage}
                                        disabled={!productdata[key]?.includes('%')||check}
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
                                                <span className=''>{allergen.text}</span>
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
            <button type="submit" className="rounded bg-buttonBleu hover:bg-buttonBleuHover text-white py-1 ml-3 my-5 w-full">{Text.submitButton}</button>
            }
            <div className='mb-10'></div>
        </form>
    );
}

export default AdvanceForm;
