
import React, { useEffect, useState, useCallback, useContext } from 'react';
import CategoryForm from "./categoryForm";
import ImgUploadButton from '../reuseComponent/imgUploadButton';
import ColorSelect from '../reuseComponent/colorSelect';
import { UserContext } from '../../userInfo';
import { addCategory, checkCategoryNameExistence, updateCategory } from '../../service/category';
import { toast } from 'react-toastify';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import AdvanceCategoryForm from './advanceCategoryForm';
import { useLocation, useNavigate } from 'react-router-dom';

function AddCategory() {
    // receivedData、productDataReceived = 从home传输过来的data，和data中的product信息
    // normalData、advanceData用于同步两张表单的数据，以便submit
    let location = useLocation();
    const receivedData = location.state;
    const navigate = useNavigate();
    const categoryDataReceived = receivedData?receivedData.category:null;
    const check = receivedData?receivedData.type==='check':false;
    const edit = receivedData?receivedData.type==='edit':false;
    // const Language = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const TextLanguage = {...multiLanguageText}[Language]
    const Text = TextLanguage.category
    const pageName = Text[check?'check':edit?'edit':'add'].pageName;

    useEffect(()=>{
        if(check||edit){
            setColor(categoryDataReceived.color);
            setTextColor(categoryDataReceived.text_color);
            setInitProductImg(categoryDataReceived.img);
        }
    }, [])

    const [initProductImg, setInitProductImg] = useState(null)

    const [img, setImg] = useState(null)
    const [imgUrl, setImgUrl] = useState(null)
    const handleImgSelect = (img)=>{
        setImg(img);
        setImgUrl(null);
    }

    const [color, setColor] = useState('');
    const [textColor, setTextColor] = useState('');
    const handleColorSelect = (color, textColor)=>{
        setColor(color);
        setTextColor(textColor);
    }

    const [advancePage, setAdvancePage] = useState(false)
    const [advanceData, setAdvanceData] = useState(null);
    const [normalData, setNormalData] = useState(null);
    const storeNormaldata = (normalDataReceived)=>{
        setNormalData(normalDataReceived)
    }
    const storeAdvancedata = (advanceDataReceived)=>{
        setAdvanceData(advanceDataReceived)
    }

    const checkAtlLeastOneField = () => {
        if(!normalData.time_supply){
            toast.warning(Text.time_supply[2]);
            return false
        }
        return true
    }

    const handleCategorySubmit = async(event)=>{
        event.preventDefault();

        // 检查部分 多选框 是否未选择
        if(!checkAtlLeastOneField()){
            return
        }

        // 检查name是否重复
        if(!edit||(edit&&(categoryDataReceived.name!==normalData.name))){
            const existed = await checkCategoryNameExistence(normalData.name)
            if (existed){
                toast.error(Text.name[2]);
                return
            } 
        }

        // 合并normalData，advanceData
        const mergedCategoryData = Object.assign({}, advanceData, normalData)
        // 仅在编辑保存时获取id，用于更新
        if(edit) mergedCategoryData['id'] = categoryDataReceived.id;
        // 获取color和img数据
        mergedCategoryData['color'] = color;
        mergedCategoryData['text_color'] = textColor;
        mergedCategoryData['img'] = img;
        if(imgUrl) mergedCategoryData['imgUrl'] = imgUrl;

        const submitSucceed = edit? await updateCategory(mergedCategoryData): await addCategory(mergedCategoryData)
        if(edit){
            if(submitSucceed){
                toast.success(Text.edit.editSuccess)
                navigate('/pos/home', {state: { editedCategoryId: categoryDataReceived.id }})
            }else{
                toast.error(Text.edit.editFailed)
            }
        }else{
            if(submitSucceed){
                toast.success(Text.add.addSuccess)
            }else{
                toast.error(Text.add.addFailed)
            }
        }
    }

    const handleClickReturn=()=>{
        navigate('/pos/home', {state: { editedCategoryId: categoryDataReceived.id }})
    }

    // 暂不支持删除类别
    const handleDelete=()=>{
        const id = receivedData.id
        console.log(id)
    }


    return (
        <div className='flex flex-col w-full bg-slate-200 pt-10 max-h-screen overflow-y-auto overflow-x-hidden'>
            <span className='-mt-3 mb-3 ml-7 text-3xl'><b>{pageName}: {advancePage?TextLanguage.advanceTitle:TextLanguage.normalTitle}</b></span>
            <div className='flex flex-row w-full '>
                <div className='flex flex-col items-center w-2/12 mt-5'>
                    <ImgUploadButton onImgSelect={handleImgSelect} check={check} edit={edit} imgReceived={initProductImg}/>
                    <button 
                        className="flex justify-center items-center px-4 py-2 mt-20 w-2/3 bg-buttonRed hover:bg-buttonRedHover text-white rounded-lg" 
                        onClick={()=>{setAdvancePage(advancePage?false:true)}}>
                        {advancePage?Text.returnNormalButton:Text.advanceButton}
                    </button>
                    {/* {edit &&
                    <button className='btn-red mt-64' onClick={handleDelete}>
                        {Text.delete.deleteButton}
                    </button>
                    } */}
                </div>
                <div className='w-7/12'>
                    {!advancePage && <CategoryForm 
                        onCategorySubmit={handleCategorySubmit} 
                        normalData={normalData}
                        sendDataToParent={storeNormaldata} 
                        check={check}
                        edit={edit}
                        categoryDataReceived={categoryDataReceived}
                    />
                    }
                    {advancePage &&
                    <AdvanceCategoryForm 
                        onCategorySubmit={handleCategorySubmit}
                        advanceData={advanceData} 
                        sendDataToParent={storeAdvancedata}
                        check={check}
                        edit={edit}
                        categoryDataReceived={categoryDataReceived}
                    />
                    }
                </div>
                <div className='w-2/12'>
                    <ColorSelect 
                        onColorChange={handleColorSelect}
                        advance={advancePage}
                        check={check}
                        edit={edit}
                        colorReceived={color}
                        textColorReceived={textColor}/>
                </div>
            </div>
            {(edit||check)&&
            <button className='absolute right-20 bottom-5 ml-5 btn-bleu' onClick={handleClickReturn}>
                {TextLanguage.returnButton}
            </button>
            }
        </div>
    );
}

export default AddCategory;
  