import React, { useRef, useState } from 'react';
import addPictureDefault from '../../img/add-picture.svg'
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';

const ImgUploadButton = ({ onImgSelect }) => {
    const Text = multiLanguageText[Language]
    const [imgUrl, setImgUrl] = useState(null);
    

    const imgInputRef = useRef(null);
    const handleClick = () => {
        imgInputRef.current.click();
    };
    const handleFileSelect = (e) => {
        const selectedImg = e.target.files[0];
        let selectedImgUrl = ''
        if(selectedImg) {
            selectedImgUrl = URL.createObjectURL(selectedImg);
            setImgUrl(selectedImgUrl)
            onImgSelect(selectedImg);
        }
    };


    return (
        <div className='mt-2 w-3/4'>
            {Text.Img[0]}
            <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"  // 只允许选择图片文件
                style={{ display: 'none' }} // 隐藏默认的文件选择框
                ref={imgInputRef}
            />
            <img 
                src={imgUrl?imgUrl:addPictureDefault} 
                alt="Selected" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
                onClick={handleClick}
                className='w-full object-fill cursor-pointer'/>
            <button className="rounded bg-blue-500 text-white py-1 my-2 w-full" onClick={handleClick}>
                {Text.Img[1]}
            </button>
        </div>
    );
    };

export default ImgUploadButton;
