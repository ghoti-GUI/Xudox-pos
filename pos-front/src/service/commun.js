import axios from 'axios';
import { getCsrfToken } from './token';
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
            }
        })
        return;
    }catch(error){
        console.error('There was an error updating rules', error);
        return error;
    }
}

