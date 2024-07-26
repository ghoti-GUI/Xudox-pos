import axios from 'axios';
import { getCsrfToken, token } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';
import { multiLanguageText } from '../multiLanguageText/multiLanguageText';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Language } from '../userInfo';

const Text = {...multiLanguageText}[Language];

const csrfToken = getCsrfToken();

export const deleteAll = async(rid)=>{
    try{
      await axios.post(DefaultUrl+'delete/all/', 
      {'rid':rid},
      {
        headers: {
          'X-CSRFToken': csrfToken, 
          'content-type': 'multipart/form-data', 
          // 'Authorization': `Bearer ${token}`,
        }
      });
      // toast.success(Text.edit.editSuccess);
      console.log('delete succeed')
      return true;
    }catch (error) {
      console.error('Error delete all:', error);
      return false
    };
}


export const updateXu_class = async(data)=>{
    try{
        await axios.post(DefaultUrl+'update/Xu_class/', 
            data,
            {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
                // 'Authorization': `Bearer ${token}`,
            }
        })
        return;
    }catch(error){
        console.error('There was an error updating rules', error);
        return error;
    }
}

// export const fetchImgFile = async(imgUrl)=>{
//   const imgUrlList = imgUrl.split('/')
//   const imgName = imgUrlList[imgUrlList.length-1]
//   try {
//     const response = await fetch('http://localhost:8000'+imgUrl, {
//       method:'GET',
//       headers: {
//         'X-CSRFToken': csrfToken, 
//         'Content-Type': 'image/jpeg', 
//         'Access-Control-Request-Headers': 'access-control-allow-origin,content-type,x-csrftoken',
//         'Access-Control-Request-Method':'GET', 
//         'Sec-Fetch-Mode':'cors', 
//       },
//     });
//     const blob = await response.blob();

//     const file = new File([blob], imgName, { type: 'image/'+imgName.split('.')[1] });
//     console.log('file:', file)
//     return(file)
//   } catch (error) {
//     console.error('Error fetching the image:', error);
//     return null
//   }
// }