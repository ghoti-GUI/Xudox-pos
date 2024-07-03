// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';
import { multiLanguageText } from '../components/multiLanguageText';

const language = 'English'
const Text = multiLanguageText[language]

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

export const checkIdXuExistence = async (id_Xu, setChecked) => {
  try {
    const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
      params:{
        'id_Xu':id_Xu, 
      }
    });
    console.log('checked back', response.data.existed)
    setChecked(response.data.existed)
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
  };
}


export const fetchAllProduct = async () => {
  try {
    const response = await axios.get(DefaultUrl+GetAllProduct);
    const productsData = response.data;
    return (productsData); 
  } catch (error){
    console.error('Error fetching products data:', error)
  }
}


export const fetchProductById_Xu = async(id_Xu)=>{
  try {
    const response = await axios.get(DefaultUrl+'get/product/by/id_Xu/', {
      params:{
        'id_Xu':id_Xu, 
      }
    });
    return (response.data)
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
    return
  };
}