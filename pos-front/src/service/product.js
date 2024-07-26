// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken, token } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';
import { multiLanguageText } from '../multiLanguageText/multiLanguageText';
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
    const response = await axios.post(DefaultUrl+'post/product/', 
      productData,
      {
      headers: {
          'X-CSRFToken': csrfToken, 
          'content-type': 'multipart/form-data', 
          // 'Authorization': `Bearer ${token}`,
      }
    })
    return {'success':true, 'message':response.data};
  }catch(error) {
      // toast.error(Text.product.addFailed);
      console.error('There was an error submitting the form!', error);
      return {'success':false, 'message':error};
  };
}


export const updateProduct = async(productData)=>{
  try{
    const response = await axios.post(DefaultUrl+'update/product_by_id/', 
    productData,
    {
      headers: {
        'X-CSRFToken': csrfToken, 
        'content-type': 'multipart/form-data', 
        // 'Authorization': `Bearer ${token}`,
      }
    });
    // toast.success(Text.edit.editSuccess);
    return {'success':true, 'message':response.data};
  }catch(error) {
      // toast.error(Text.edit.editFailed)
      console.error('There was an error submitting the form!', error);
      return {'success':false, 'message':error};
  };
}


export const checkIdXuExistence = async (id_Xu, dinein_takeaway, rid) => {
  try {
    const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
      params:{
        'id_Xu':id_Xu, 
        'rid':rid, 
        'dinein_takeaway':dinein_takeaway,
      },
      headers: {
        // 'Authorization': `Bearer ${token}`,
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
      },
      headers: {
        // 'Authorization': `Bearer ${token}`,
      }
    });
    const productsData = response.data;
    return (productsData); 
  } catch (error){
    console.error('Error fetching products data:', error)
  }
}

export const fetchAllProductFrontForm = async(rid)=>{
  // console.log('token:', token)
  try {
    const response = await axios.get(DefaultUrl+'get/product/all/frontform/', {
      params:{
        'rid':rid, 
      },
      headers: {
        // 'Authorization': `Bearer ${token}`,
      }
    });
    const productsData = response.data;
    return (productsData); 
  } catch (error){
    console.error('Error fetching products data:', error)
  }
}


export const fetchProductById_Xu = async(id_Xu, dinein_takeaway, rid)=>{
  try {
    const response = await axios.get(DefaultUrl+'get/product/by/id_Xu/', {
      params:{
        'id_Xu':id_Xu, 
        'rid':rid,
        'dinein_takeaway':dinein_takeaway
      },
      headers: {
        // 'Authorization': `Bearer ${token}`,
      }
    });
    return (response.data)
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
    return
  };
}


export const deleteProduct = async(id, rid)=>{
  try {
    const response = await axios.post(DefaultUrl+'delete/product/', {
      'id':id, 
      'rid':rid
    },
    {
      headers: {
        'X-CSRFToken': csrfToken, 
        'content-type': 'multipart/form-data', 
        // 'Authorization': `Bearer ${token}`,
      }
    });
    return {'success':true, 'message':response.data.message}
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
    return {'success':false, 'message':error}
  };
}
