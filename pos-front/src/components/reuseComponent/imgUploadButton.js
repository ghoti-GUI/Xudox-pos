import React, { useRef, useState, useEffect } from 'react';
import addPictureDefault from '../../img/add-picture.svg'; 
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';

const ImgUploadButton = ({ onImgSelect, check=false, edit=false, imgReceived}) => {
    const Text = {...multiLanguageText}[Language].img
    const [imgUrl, setImgUrl] = useState(false);
    // const [imgChanged, setImgChanged] = useState(false);
    

    const imgInputRef = useRef(null);
    const handleClick = () => {
        imgInputRef.current.click();
    };
    const handleFileSelect = (e) => {
        const selectedImg = e.target.files[0];
        let selectedImgUrl = ''
        if(selectedImg) {
            selectedImgUrl = URL.createObjectURL(selectedImg);
            setImgUrl(selectedImgUrl);
            onImgSelect(selectedImg);
        }
    };

    useEffect(()=>{
        if(check || edit) setImgUrl('http://localhost:8000/'+imgReceived);

    },[check, edit, imgReceived]);


    return (
        <div className='mt-2 w-3/4'>
            {check?Text.check:Text.chooseImg}
            <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"  // 只允许选择图片文件
                style={{ display: 'none' }} // 隐藏默认的文件选择框
                ref={imgInputRef}
                disabled={check}
            />
            <img 
                src={imgUrl||addPictureDefault} 
                alt="Selected" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
                onClick={handleClick}
                className={`w-full object-fill ${check?'':'cursor-pointer'}`}
                disabled={check}/>
            {!check&&
                <button className="rounded bg-blue-500 text-white py-1 my-2 w-full" onClick={handleClick}>
                    {Text.changeImg}
                </button>
            }
        </div>
    );
    };

export default ImgUploadButton;
