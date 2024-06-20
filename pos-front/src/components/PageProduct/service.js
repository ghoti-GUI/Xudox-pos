// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DefaultUrl } from '../../valueDefault';
import { GetNextIdUserUrl,CheckIdXuExistenceUrl, GetCategoryUrl, GetPrinterUrl, GetTVACountryUrl } from '../../valueDefault';
import { multiLanguageText } from '../../multiLanguageText';

const language = 'English'
const Text = multiLanguageText[language]

export const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
  };

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
  const csrfToken = getCsrfToken()
  try {
    const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
      params:{
        'id_Xu':id_Xu, 
      }
    });
    // return response.data.existed
    console.log('checked back', response.data.existed)
    setChecked(response.data.existed)
    // if (response.data.existed) alert(Text.id_Xu[2])
  } catch (error) {
    console.error('Error check id_Xu existence:', error);
  };
}
  
export const fetchCategory = async (setCategoryData) => {
  try {
    const response = await axios.get(DefaultUrl+GetCategoryUrl);
    const categoryData = response.data;
    setCategoryData(categoryData); 
  } catch (error){
    console.error('Error fetching category data:', error)
  }
}

export const fetchPrinter = async (setPrint) => {
  try {
    const response = await axios.get(DefaultUrl+GetPrinterUrl);
    const printDataList = Object.entries(response.data).map(([id, printer])=>{
      return{'id':id, 'printer':printer, 'checked':false}
    })
    setPrint(printDataList); 
    return printDataList
  } catch (error){
    console.error('Error fetching printer data:', error)
  }
}

export const fetchTVA = async (setTVA, setTVACountry, language) =>{
  try {
    const response = await axios.get(DefaultUrl+GetTVACountryUrl, {
      params:{
        'language':language, 
      }
    });
    const TVAData = response.data; //Dutch: {21.00%: 1, 9.00%: 2, 0.00%: 3}
    // console.log(TVAData)
    setTVA(TVAData); 
    const TVACountry = {}
    for (const country in TVAData){
      TVACountry[country]=country;
    }
    setTVACountry(TVACountry)
  } catch (error){
    console.error('Error fetching TVA data:', error)
  }
}