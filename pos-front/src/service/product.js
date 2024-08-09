// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken, token } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';

const csrfToken = getCsrfToken();


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
        return {'success':true, 'message':response.data};
    }catch(error) {
        console.error('There was an error submitting the form!', error);
        return {'success':false, 'message':error};
    };
}


export const checkIdXuExistence = async (id_Xu, dinein_takeaway) => {
    try {
        const response = await axios.get(DefaultUrl+CheckIdXuExistenceUrl, {
            params:{
                'id_Xu':id_Xu, 
                'dinein_takeaway':dinein_takeaway,
            },
        });
        return(response.data.existed)
    } catch (error) {
        console.error('Error check id_Xu existence:', error);
        return false
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

export const fetchAllProductFrontForm = async()=>{
    try {
        const response = await axios.get(DefaultUrl+'get/product/all/frontform/');
        const productsData = response.data;
        return (productsData); 
    } catch (error){
        console.error('Error fetching products data:', error)
    }
}


export const fetchProductById_Xu = async(id_Xu, dinein_takeaway)=>{
    try {
        const response = await axios.get(DefaultUrl+'get/product/by/id_Xu/', {
            params:{
                'id_Xu':id_Xu, 
                'dinein_takeaway':dinein_takeaway
            },
        });
        return (response.data)
    } catch (error) {
        console.error('Error check id_Xu existence:', error);
        return
    };
}


export const deleteProduct = async(id)=>{
    try {
        const response = await axios.post(DefaultUrl+'delete/product/', {
            'id':id, 
        },
        {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
                'Authorization': `Bearer ${token}`,
            }
        });
        return {'success':true, 'message':response.data.message}
    } catch (error) {
        console.error('Error delete product:', error);
        return {'success':false, 'message':error}
    };
}
