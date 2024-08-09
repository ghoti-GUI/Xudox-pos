import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetAllCategoryUrl} from './valueDefault';
import { toast } from 'react-toastify';

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
        toast.error('add category failed:\n', error)
        return false; 
    }
}

export const fetchAllCategory = async () => {
    try {
        const response = await axios.get(DefaultUrl+GetAllCategoryUrl, {
        });
        const categoryData = response.data;
        return categoryData
    } catch (error){
        console.error('Error fetching category data:', error)
    }
}

export const fetchCidByCategoryName = async(categoryName)=>{
    try{
        const response = await axios.get(DefaultUrl+'get/cid/by/categoryName/',
            {params:{'category_name':categoryName}},
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

export const fetchCategoryByName = async(categoryName)=>{
    try{
        const response = await axios.get(DefaultUrl+'get/category/by/name/',
            {params:{'category_name':categoryName}},
            {
                headers: {
                    'X-CSRFToken': csrfToken, 
                    'content-type': 'multipart/form-data', 
                }, 
            })
        return {'success':true, 'data':response.data}
    }catch(error){
        console.error('fetch cid failed', error);
        return {'success':false, 'message':error}
    }
}

export const checkCategoryNameExistence = async(categoryName)=>{
    try {
        const response = await axios.get(DefaultUrl+'category/check_name_category_existence/', {
            params:{
                'categoryName':categoryName, 
            },
        });
        return response.data.existed
    } catch (error) {
        console.error('Error check category id existence:', error);
        return error
    };
}

export const updateCategory = async(categorydata)=>{
    try{
        const response = await axios.post(DefaultUrl + 'update/category_by_id/',
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
        toast.error('update category failed:\n', error)
        return false; 
    }
}