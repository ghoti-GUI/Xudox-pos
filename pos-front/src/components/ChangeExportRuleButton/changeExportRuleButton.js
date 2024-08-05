import React, { useContext, useState } from 'react';
import { getCsrfToken } from '../../service/token';
import axios from 'axios';
import { DefaultUrl } from '../../service/valueDefault';
import { toast } from 'react-toastify';
import { UserContext  } from '../../userInfo';
import { updateXu_class } from '../../service/commun';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';


const ChangeExportRuleButton = () => {
    // const LanguageLocal = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].changeExportRule
    const changeRule = async (onloadEvent, pageEvent)=>{
        // console.log('changeRule')
        const content = onloadEvent.target.result;
        let lines = content.split('\n');
        lines = lines.filter(line => line.trim() !== 'Contents');

        let succeed = true
        for (const line of lines){
            let succeedCopy = succeed
            // console.log(line)
            const [Xu_class, ...categoryName] = line.split(' ');
            const category = categoryName.join(' ');
            if(category && category!=='void'){

                pageEvent.preventDefault();

                const error = await updateXu_class({'Xu_class':Xu_class, 'category_name':category});
                if(error){
                    toast.error(`${Text.updateFailed} ${Xu_class}, ${category}: ${error}`, {autoClose:10000});
                    console.error('There was an error updating rules', error);
                    succeedCopy = false;
                }
            }
            succeed = succeedCopy;
            pageEvent.target.value = '';
        };
        if(succeed){
            toast.success(Text.allUpdateSucceed);
        }
    }

    const handleFileSelect = (event)=>{
        const file = event.target.files[0];
        const name = file.name;
        console.log('name:', name)
        if(file){
            if(name === 'HooftName.txt'){
                const reader = new FileReader();
                reader.onload = (e)=>changeRule(e, event);
                reader.readAsText(file);
            }else{
                toast.error(Text.fileNameInvalide)
            }
        }
    }

    const handleClick = ()=>{
        document.getElementById('uploadFileChangeRule').click();
    }

    return (
        <div className='flex items-center justify-center w-full mt-4'>
            <button onClick={handleClick} className='flex items-center justify-center py-1 w-5/6 bg-buttonBleu text-white hover:bg-buttonBleuHover rounded-lg'>
                {Text.button}
            </button>
            <input
                type='file'
                id='uploadFileChangeRule'
                style={{ display: 'none' }}
                onChange={(e)=>handleFileSelect(e)}
            />
        </div>
    );
}

export default ChangeExportRuleButton;
