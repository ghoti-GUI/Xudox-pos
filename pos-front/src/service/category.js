import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetAllCategoryUrl} from './valueDefault';
import { Language } from '../userInfo';
import { multiLanguageText } from '../components/multiLanguageText';

const Text = {...multiLanguageText}[Language];

const csrfToken = getCsrfToken();

export const addCategory = async(categorydata)=>{
  try{
    const response = await axios.post(DefaultUrl + 'post/category/',
      categorydata,
      {
          headers: {
              'X-CSRFToken': csrfToken,
              'content-type': 'multipart/form-data',
          }
      }
    );
    return response.data; 
  } catch (error) {
    console.error('There was an error submitting the form!', error);
    return false; 
}
}

export const fetchAllCategory = async (rid) => {
  try {
    const response = await axios.get(DefaultUrl+GetAllCategoryUrl, {
      params:{
        'rid':rid, 
      }
    });
    const categoryData = response.data;
    return categoryData
  } catch (error){
    console.error('Error fetching category data:', error)
  }
}