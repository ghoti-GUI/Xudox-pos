// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { DefaultUrl } from './valueDefault';




export const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
  };

export const fetchNextIdUser = async (setProductData) => {
    try {
      const response = await axios.get(DefaultUrl+'get/product/next_id_user/');
      const nextIdUser = response.data.next_id_user;
      setProductData(prevState => ({
        ...prevState,
        'id_user': nextIdUser,
      }));
    } catch (error) {
      console.error('Error fetching next product id:', error);
    };
  };
  
export const fetchCategory = async (setCategoryData) => {
  try {
    const response = await axios.get(DefaultUrl+'get/category/');
    const categoryData = response.data;
    setCategoryData(categoryData); 
  } catch (error){
    console.error('Error fetching category data:', error)
  }
}

export const fetchPrinter = async (setPrint) => {
  try {
    const response = await axios.get(DefaultUrl+'get/printer/');
    const printDataList = Object.entries(response.data).map(([id, printer])=>{
      return{'id':id, 'printer':printer, 'checked':false}
    })
    setPrint(printDataList); 
    // console.log(printDataList)
  } catch (error){
    console.error('Error fetching printer data:', error)
  }
}