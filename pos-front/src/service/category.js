import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetAllCategoryUrl} from './valueDefault';
import { Language, RestaurantID } from '../userInfo';
import { multiLanguageText } from '../multiLanguageText/multiLanguageText';

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

export const fetchAllCategory = async (rid=RestaurantID) => {
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

export const fetchCidByCategoryName = async(categoryName, rid=RestaurantID)=>{
  try{
    const response = await axios.get(DefaultUrl+'get/cid/by/categoryName/',
      {params:{'category_name':categoryName, 'rid':rid}},
      {
          headers: {
              'X-CSRFToken': csrfToken, 
              'content-type': 'multipart/form-data', 
          }, 
      })
    return response.data.cid
  }catch(error){
    console.error('fetch cid failed', error);
    return false
  }
}

export const checkCategoryNameExistence = async(categoryName, rid=RestaurantID)=>{
  try {
    const response = await axios.get(DefaultUrl+'category/check_name_category_existence/', {
      params:{
        'categoryName':categoryName, 
        'rid':rid
      }  
    });
    return response.data.existed
  } catch (error) {
    console.error('Error check category id existence:', error);
    return error
  };
}