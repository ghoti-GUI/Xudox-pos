import React, { useContext } from 'react';
import { UserContext } from '../../userInfo';
import { multilanguageLanguage } from '../../multiLanguageText/multiLanguageText';

const ChangeLanguageButton = () => {
    const { Language, setLanguage } = useContext(UserContext);
    const Text = {...multilanguageLanguage};
    const languageChoise = ['English', 'Chinese'];
    return (
        <div className='flex flex-row  text-black'>
            <span className='px-2 bg-white rounded-l-lg border-r border-black'>{"Language:"}</span>
            <select 
                value={Language} 
                onChange={(e) => {setLanguage(e.target.value)}}
                className={`flex w-3/4 px-2 rounded-r-lg`}
                >
                  <option value="" disabled>{'Choose your language'}</option>
                  {Object.entries(languageChoise).map(([index, language])=>(
                    <option key={index} value={language} className='text-black'>{Text[language]}</option>
                  ))}
              </select>
        </div>
    );
}

export default ChangeLanguageButton;
