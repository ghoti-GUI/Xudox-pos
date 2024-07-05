import React, { useEffect, useState } from 'react';
import {SketchPicker} from 'react-color';
import { multiLanguageText } from '../multiLanguageText';
import { Language } from '../../userInfo';

const ColorSelect = ({ onColorChange, Id, advance=false, check=false, edit=false, colorReceived, textColorReceived }) => {
  const Text = multiLanguageText[Language].color
  const [color, setColor] = useState(`rgb(255, 255, 255)`);
  const colorDefault = [
    '#FF0000', "#FF4F00", '#FFAF00', "#FFFE00", '#E6FF00', '#86FF00', '#00FFBE', '#00F2FF',
    "#00C6FF", "#006FFF", "#4900FF", "#8F00FF", "#CC00FF", "#FF00E3", "#FF0094", "#842121", 
  ]


  // 0.2126 * r + 0.7152 * g + 0.0722 * b  >= 128
  const [textColor, setTextColor] = useState(`rgb(0, 0, 0)`);
  const [autoTextColor, setAutoTextColor] = useState(true);

  const autoChangeTextColor = (bgColor)=>{
    const rgb = bgColor.replace('rgb(', '').replace(')','').split(',').map(Number);
    const grayLevel = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    let changeTextColorTo = 'rgb(0, 0, 0)'
    if (grayLevel >= 128) {
      changeTextColorTo='rgb(0, 0, 0)'
    } else {
      changeTextColorTo='rgb(255, 255, 255)'
    }
    setTextColor(changeTextColorTo)
    return changeTextColorTo
  }

  const handleAutoTextColorChange = (checked) =>{
    setAutoTextColor(checked)
    autoChangeTextColor(color)
  }

  const handleTextColorChange = (colorInput)=>{
    const rgbColor = `rgb(${colorInput.rgb.r}, ${colorInput.rgb.g}, ${colorInput.rgb.b})`
    setTextColor(rgbColor)
  }
  

  const handleColorChange = (colorInput) => {
    const rgbColor = `rgb(${colorInput.rgb.r}, ${colorInput.rgb.g}, ${colorInput.rgb.b})`
    setColor(rgbColor)
    if(autoTextColor){
      onColorChange(rgbColor, autoChangeTextColor(rgbColor))
    }else{
      onColorChange(rgbColor, textColor)
    }
  };

  useEffect(()=>{
    if(edit || check){
      setColor(colorReceived);
      setTextColor(textColorReceived);
    }
  },[edit,check,colorReceived,textColorReceived])

  return (
    <div className='ml-7 mt-2 w-full'>
      <div className='flex flex-col'>
        {!check&&
          <label className='flex justify-center mt-1 px-2 py-1 bg-white rounded-lg'>
            <input
              type='checkbox'
              checked={autoTextColor}
              onChange={(e) => handleAutoTextColorChange(e.target.checked)}
              className='form-radio'/>
            <span className='ml-2'>{Text.text_color[0]}</span>
          </label>
        }
        {!autoTextColor && !advance &&
          <div className='flex flex-row justify-center mt-1'>
            <label className='flex justify-center items-center w-1/2 mb-1 py-1 bg-white border-r rounded-lg'>
              <input
                type='radio'
                checked={textColor==='rgb(0, 0, 0)'}
                onChange={()=>setTextColor('rgb(0, 0, 0)')}
                className='form-radio'/>
              {Text.text_color[1][0]}
            </label>
            <label className='flex justify-center items-center w-1/2 mb-1 py-1 bg-white rounded-lg'>
              <input
                type='radio'
                checked={textColor==='rgb(255, 255, 255)'}
                onChange={()=>setTextColor('rgb(255, 255, 255)')}
                className='form-radio'/>
              {Text.text_color[1][1]}
            </label>
          </div>
        }
        {!autoTextColor && advance && 
          <SketchPicker
            color={textColor}
            onChange={handleTextColorChange} 
            width='90%'
            presetColors={colorDefault}
            className='my-1'
          />
        }
        <div className='mt-2 w-full mr-3'>
          <div className='flex justify-center items-center w-full h-20' style={{backgroundColor:color}}>
            <span style={{ color:textColor}}>{Id||Text.textDefault}</span>
          </div>
        </div>
        {!check &&
          <span className='mt-2'>{Text.bgcolor}</span>
        }
        {!check &&
          <SketchPicker
            color={color}
            onChange={handleColorChange} 
            width='90%'
            presetColors={colorDefault}
            className='mt-1'
          />
        }
        
        
      </div>
    </div>
  );
};

export default ColorSelect;
