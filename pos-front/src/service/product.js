// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';
import { multiLanguageText } from '../components/multiLanguageText';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Language } from '../userInfo';


const Text = {...multiLanguageText}[Language];

const csrfToken = getCsrfToken();

// export const fetchNextIdUser = async (setProductData) => {
//     try {
//       const response = await axios.get(DefaultUrl+GetNextIdUserUrl);
//       const nextIdUser = response.data.next_id_user;
//       setProductData(prevState => ({
//         ...prevState,
//         'id_user': nextIdUser,
//       }));
//     } catch (error) {
//       console.error('Error fetching next product id:', error);
//     };
//   };


export const addProduct = async(productData)=>{
  try{
    await axios.post(DefaultUrl+'post/product/', 
      productData,
      {
      headers: {
          'X-CSRFToken': csrfToken, 
          'content-type': 'multipart/form-data', 
      }
    })
    // toast.success(Text.product.addSuccess);
    return true;
  }catch(error) {
      // toast.error(Text.product.addFailed);
      console.error('There was an error submitting the form!', error);
      return error;
  };
}


export const updateProduct = async(productData)=>{
  try{
    await axios.post(DefaultUrl+'update/product_by_id/', 
    productData,
    {
      headers: {
        'X-CSRFToken': csrfToken, 
        'content-type': 'multipart/form-data', 
      }
    });
    // toast.success(Text.edit.editSuccess);
    return true;
  }catch(error) {
      // toast.error(Text.edit.editFailed)
      console.error('There was an error submitting the form!', error);
      return false;
  };
}


export const checkIdXuExistence = async (id_Xu, rid) => {
  try {
    const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
      params:{
        'id_Xu':id_Xu, 
        'rid':rid
      }
    });
    console.log('checked back', response.data.existed)
    return(response.data.existed)
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
    return false
  };
}


export const fetchAllProduct = async (rid) => {
  try {
    const response = await axios.get(DefaultUrl+GetAllProduct, {
      params:{
        'rid':rid, 
      }
    });
    const productsData = response.data;
    return (productsData); 
  } catch (error){
    console.error('Error fetching products data:', error)
  }
}

export const fetchAllProductFrontForm = async(rid)=>{
  try {
    const response = await axios.get(DefaultUrl+'get/product/all/frontform/', {
      params:{
        'rid':rid, 
      }
    });
    const productsData = response.data;
    return (productsData); 
  } catch (error){
    console.error('Error fetching products data:', error)
  }
}


export const fetchProductById_Xu = async(id_Xu, rid)=>{
  try {
    const response = await axios.get(DefaultUrl+'get/product/by/id_Xu/', {
      params:{
        'id_Xu':id_Xu, 
        'rid':rid
      }
    });
    console.log(response.data)
    return (response.data)
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
    return
  };
}



