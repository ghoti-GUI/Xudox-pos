import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetAllCategoryUrl} from './valueDefault';


export const fetchAllCategory = async () => {
  try {
    const response = await axios.get(DefaultUrl+GetAllCategoryUrl);
    const categoryData = response.data;
    return categoryData
  } catch (error){
    console.error('Error fetching category data:', error)
  }
}