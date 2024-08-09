import React, { useContext, useEffect, useState } from 'react';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { UserContext } from '../../userInfo';
import { addSwDiscount, deleteSwDiscount, fetchAllSwDiscount, updateSwDiscount } from '../../service/sw_discount';
import { ReactComponent as AddSwDiscount } from '../../img/add-noborder.svg';
import { toast } from 'react-toastify';
import { swDiscountModel } from '../../models/swDiscount';

const EditSiteWideDiscount = () => {
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].sideWideDiscount
    const [allSwDiscount, setAllSwDiscount] = useState([{...swDiscountModel}])

    useEffect(()=>{
        const fetchData = async()=>{
            let allSwDiscount_recv = await fetchAllSwDiscount();
            if(allSwDiscount_recv.length>0){
                allSwDiscount_recv = allSwDiscount_recv.map((swDiscount)=>{
                    return{
                        ...swDiscount,
                        'discount':swDiscount.discount.replace(/\D/g, ''), 
                        'state':null,
                        'discountType':swDiscount.discount?.includes('€')?'fixed':'percentage',
                    }
                })
                setAllSwDiscount(allSwDiscount_recv);
            }
        };fetchData();
    },[])

    const handleChange = (index, key, value)=>{
        let updatedSwDiscountData = [...allSwDiscount]
        updatedSwDiscountData[index].state = 'edited';
        if(value && key!=='discountType'){
            updatedSwDiscountData[index][key] = value.replace(/\D/g, '');
        }else{
            updatedSwDiscountData[index][key] = value;
        }
        console.log(updatedSwDiscountData)
        setAllSwDiscount(updatedSwDiscountData)
    }

    // 给数组中添加空数据
    const handleClickAddSwDiscount = async()=>{
        setAllSwDiscount([
            ...allSwDiscount,
            {...swDiscountModel},
        ])
    }

    const hancleClickSave = async(index, discountData)=>{
        if(!discountData.consumption) {
            toast.error(Text.consumption[2]);
            return
        }
        if(!discountData.discount) {
            toast.error(Text.discount[2]);
            return
        }

        const discount_to_save = {
            ...discountData,
            'discount':discountData.discount+(discountData.discountType==='fixed'?'€':'%')
        }

        let response = null
        if(discount_to_save.hasOwnProperty('id')){
            response = await updateSwDiscount(discount_to_save)
        }else{
            response = await addSwDiscount(discount_to_save)
        }

        if(response.success){
            handleChange(index, 'state', null)
            toast.success(Text.saveSuccess)
        }else{
            toast.error(Text.saveFailed+':\n'+JSON.stringify(response.message))
        }
    }

    const handleDelete = async(index, discountData)=>{
        if(discountData.hasOwnProperty('id')){
            const response = await deleteSwDiscount(discountData.id)
            if(response.success){
                toast.success(Text.deleteSuccess)
                return;
            }else{
                toast.error(Text.deleteFailed+':\n'+JSON.stringify(response.message))
                return;
            }
        }
        const newDiscountList = allSwDiscount.filter((_, idx) => idx !== index);
        setAllSwDiscount(newDiscountList)
    }

    return (
        <div className='flex flex-col w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
            <span className='-mt-3 mb-3 ml-7 text-3xl'><b>{Text.pageName}</b></span>
            <div className='flex flex-col w-full items-center'>
                {allSwDiscount && allSwDiscount.map((swDiscount, index)=>(
                    <div key={index} className='flex flex-row justify-center w-full my-1'>
                        <div className='flex justify-center w-1/12'>
                            {swDiscount.state &&
                                <button className='btn-bleu' onClick={()=>hancleClickSave(index, swDiscount)}>
                                    {Text.saveButton}
                                </button>
                            }
                        </div>
                        <label className="flex bg-white py-2 pl-2 border-r-2  w-1/12 rounded-l-lg">
                            {Text.consumption[0]}:
                        </label>
                        <input 
                            type='text' name='consumption'
                            className="flex px-2 w-2/12 pr-5 text-right bg-white border-r-2 border-r-gray" 
                            value={swDiscount.consumption+'€'} 
                            placeholder={'€'}
                            onChange={(e) => handleChange(index, 'consumption', e.target.value)}
                            required/>
                        <label className="flex bg-white py-2 pl-2 border-r-2 w-1/12 ">
                            {Text.discount[0]}:
                        </label>
                        <input 
                            type='text' name='discount'
                            className="flex px-2 w-2/12 text-right border-r-2 bg-white" 
                            value={swDiscount.discount+(swDiscount.discountType==='fixed'?'€':'%')} 
                            placeholder={swDiscount.discountType==='fixed'?'€':'%'}
                            onChange={(e) => handleChange(index, 'discount', e.target.value)}
                            required/>
                        <select 
                            value={swDiscount.discountType} 
                            onChange={(e) => {handleChange(index, 'discountType', e.target.value)}}
                            className={`flex w-2/12 px-1 rounded-r-lg bg-white`}
                            required>
                            <option value="" disabled>{Text.discountType.default}</option>
                            <option value={'fixed'} className='text-black'>{Text.discountType.fixed}</option>
                            <option value={'percentage'} className='text-black'>{Text.discountType.percentage}</option>
                        </select>
                        <div className='flex justify-center w-1/12'>
                            <button className='btn-red' onClick={()=>handleDelete(index, swDiscount)}>
                                {Text.deleteButton}
                            </button>
                        </div>
                    </div>
                ))}
                <button 
                    className='flex items-center w-7/12 h-10 border-2 border-dashed border-gray-500'
                    onClick={handleClickAddSwDiscount}>
                    <AddSwDiscount className='w-full h-full text-red-500' style={{ fill: 'red' }}/>
                </button>
            </div>
        </div>
    );
}

export default EditSiteWideDiscount;
