import React, { useContext, useState } from 'react';
import { UserContext } from '../../userInfo';
import { multilanguageLanguage, multiLanguageText } from '../../multiLanguageText/multiLanguageText';

const ChangeLanguageButton = () => {
    // const [Language, setLanguage] = useState(localStorage.getItem('Language') || 'English');
    const { Language, setLanguage } = useContext(UserContext)
    const TextLanguage = {...multilanguageLanguage};
    const Text = {...multiLanguageText}[Language].selectLanguage
    const languageChoise = ['English', 'Chinese'];
    const handleChangeLanguage = (value)=>{
        setLanguage(value);
        localStorage.setItem('Language', value)
    }    
    return (
        <div className='flex flex-row  text-black'>
            <span className='px-2 bg-white rounded-l-lg border-r border-black'>{Text}</span>
            <select 
                value={Language} 
                onChange={(e) => {handleChangeLanguage(e.target.value)}}
                className={`flex w-3/4 px-2 rounded-r-lg`}
            >
                <option value="" disabled>{'Choose your language'}</option>
                {Object.entries(languageChoise).map(([index, language])=>(
                    <option key={index} value={language} className='text-black'>{TextLanguage[language]}</option>
                ))}
            </select>
        </div>
    );
}

export default ChangeLanguageButton;
