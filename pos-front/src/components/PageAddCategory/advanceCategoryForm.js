import React, { useEffect, useState, useContext } from 'react';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { updateObject } from '../utils';
import { UserContext } from '../../userInfo';
import { categoryModelAdvance } from '../../models/category';

const AdvanceCategoryForm = ({onCategorySubmit, advanceData, sendDataToParent, check=false, edit=false, categoryDataReceived}) => {
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].categoryAdvance
    const [categorydata, setCategoryData] = useState(advanceData||{...categoryModelAdvance})

    const inputField = []

    for (const key in categorydata){
        inputField.push(key)
    }

    useEffect(() => {
        if(advanceData){
            setCategoryData(advanceData);
        }else{
            if(check || edit){
                const updatedData = updateObject(categorydata, categoryDataReceived)
                setCategoryData(updatedData)
                sendDataToParent(updatedData)
            }
        }
    },[check, edit]);


    const handleChange = (key, value) => {
        let updatedCategoryData = {}
        updatedCategoryData = {
            ...categorydata,
            [key]: value,
        }
        setCategoryData(updatedCategoryData);
        console.log(updatedCategoryData);
        sendDataToParent(updatedCategoryData); 

    };


    return (
        <form onSubmit={onCategorySubmit} className="flex flex-col w-full">
            <span className='ml-4 text-xl'><b>{Text.advanceButton}</b></span>
            {Object.keys(categorydata).map((key)=>(
                <div key={key}>
                    <div className="flex flex-row justify-center mt-1 mx-3 w-full">
                        <label className="flex bg-white py-2 pl-3 border-r w-1/3 rounded-l-lg">
                            {Text[key][0]} :
                        </label>

                        {inputField.includes(key) && 
                        <input 
                            type={'text'} name={key} 
                            className="flex px-2 w-2/3 rounded-r-lg bg-white" 
                            value={(check?categoryDataReceived[key]:categorydata[key])||''} 
                            placeholder={Text[key][1]}
                            onChange={(e) => {handleChange(key, e.target.value)}}
                            disabled={check}/>
                        }

                    </div>

                </div>
            ))}

            {!check && 
                <button type="submit" className="rounded bg-buttonBleu hover:bg-buttonBleuHover text-white py-1 ml-3 my-5 w-full">{Text.submitButton}</button>
            }
            <div className='mb-10'></div>
        </form>
    );
}

export default AdvanceCategoryForm;
