
import React, { useEffect, useState, useContext } from 'react';
import { checkCategoryNameExistence } from '../../service/category';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { normalizeText, updateObject } from '../utils';
import { UserContext } from '../../userInfo';
import { categoryModel } from '../../models/category';
import { toast } from 'react-toastify';

function CategoryForm({onCategorySubmit, normalData, sendDataToParent, check=false, edit=false, categoryDataReceived}) {
    // const Language = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].category
    const [categorydata, setCategoryData] = useState(normalData||{...categoryModel})

    // const TimeSupplyData = {...Text.time_supply[1]}
    // const TimeSuppyKeys = Object.keys(TimeSupplyData)
    const [timeSupply, setTimeSupply] = useState({}) //{'lunch':true, 'dinner':true}

    let Xu_classList = []
    for(let i=1;i<=14;i++){
        Xu_classList.push('ab'+String(i)+'.txt')
    }
    // Xu_classList.push('meeneem.txt')

    const requiredFields = ['name', 'time_supply'];

    const noInputField = [
        ...Object.keys(requiredFields), 
        'time_supply',
        'print_to_where',
    ]
    const inputField = ['id', 'name', 'des']

    useEffect(() => {
    // 设置timeSupply选项
        if(normalData){
            // 设置time supply选项
            const timeSupplySelectionData = {
                [Text.time_supply[1][0]]:true,
                [Text.time_supply[1][1]]:true,
            }
            let time_supply_nbr=null
            time_supply_nbr = normalData.time_supply
            if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)
      
            // 获取数据
            setCategoryData(normalData)

        }else {
            // check和edit页面
            if(check||edit){
                // 读取接收到的data并储存，只读取存在在表单中的数据
                let updatedData = {...categorydata}
                updatedData=updateObject(categorydata, categoryDataReceived)

                // 设置time supply选项
                const timeSupplySelectionData = {
                    [Text.time_supply[1][0]]:true,
                    [Text.time_supply[1][1]]:true,
                }
                let time_supply_nbr=null
                time_supply_nbr = categoryDataReceived.time_supply
                if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)

                // 获取数据
                setCategoryData(updatedData)
                sendDataToParent(updatedData)

            }else{ // 添加category页面
                // 设置time supply选项
                const timeSupplySelectionData = {
                    [Text.time_supply[1][0]]:true,
                    [Text.time_supply[1][1]]:true,
                }
                let time_supply_nbr=null
                time_supply_nbr = categorydata.time_supply
                if(time_supply_nbr) updateTimeSupply(time_supply_nbr, timeSupplySelectionData)
            }
        }
    },[]);

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

    const handleChange = (key, value) => {
        let updatedData = {
            ...categorydata,
            [key]: value,
        }
        setCategoryData(updatedData);
        console.log(updatedData);
        sendDataToParent(updatedData);
    };

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


    return (
        <form onSubmit={onCategorySubmit} className="flex flex-col w-full">
            {Object.keys(categorydata).map((key)=>(
                <div key={key}>
                    <div className="flex flex-row justify-center mt-1 mx-3 w-full">
                        <label className="flex bg-white py-2 pl-4 border-r w-1/4 rounded-l-lg">
                            {Text[key][0]} :
                        </label>

                        {inputField.includes(key) && 
                        <input 
                            type='text' name={key} 
                            className="flex px-2 w-3/4 rounded-r-lg bg-white" 
                            value={categorydata[key]} 
                            placeholder={Text[key][1]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            required={requiredFields.includes(key)}
                            disabled={check}/>
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

                        {key==='Xu_class' && 
                        <select 
                            value={categorydata[key]} 
                            onChange={(e) => {
                                handleChange(key, e.target.value);
                            }}
                            className={`flex w-3/4 px-2 rounded-r-lg bg-white ${categorydata[key]===''&&!check?'text-gray-400':''} ${check?'pointer-events-none':''}`}
                            required>
                            <option value="" disabled>{Text[key][1]}</option>
                            {Xu_classList.map((Xu_calss)=>(
                                <option key={Xu_calss} value={Xu_calss} className='text-black'>{Xu_calss}</option>
                            ))}
                        </select>
                        }

                    </div>
          
                </div>
            ))}
            {!check && 
                <button type="submit" className="rounded bg-buttonBleu hover:bg-buttonBleuHover text-white py-1 ml-3 my-5 w-full">{Text.submitButton}</button>
            } 
        </form>
    );
}

export default CategoryForm;
