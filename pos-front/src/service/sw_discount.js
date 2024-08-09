// import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken, token } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct} from './valueDefault';

const csrfToken = getCsrfToken();


export const addSwDiscount = async(discountData)=>{
    try{
        const response = await axios.post(DefaultUrl+'post/sw_discount/', 
            discountData,
            {
                headers: {
                    'X-CSRFToken': csrfToken, 
                    'content-type': 'multipart/form-data', 
                }
            })
        console.log('addSwDiscount:', response.data)
        return {'success':true, 'message':response.data};
    }catch(error) {
        console.error('There was an error adding site wide discount!', error);
        return {'success':false, 'message':error};
    };
}


export const updateSwDiscount = async(discountData)=>{
    try{
        const response = await axios.post(DefaultUrl+'update/sw_discount_by_id/', 
            discountData,
            {
                headers: {
                    'X-CSRFToken': csrfToken, 
                    'content-type': 'multipart/form-data', 
                }
            });
        console.log('updateSwDiscount:', response.data)
        return {'success':true, 'message':response.data};
    }catch(error) {
        console.error('There was an error updating site wide discount!', error);
        return {'success':false, 'message':error};
    };
}

export const fetchAllSwDiscount = async () => {
    try {
        const response = await axios.get(DefaultUrl+'get/sw_discount/all/');
        const allSwDiscountsData = response.data;
        console.log('allSwDiscountsData:', allSwDiscountsData)
        return (allSwDiscountsData); 
    } catch (error){
        console.error('Error fetching sw_discounts data:', error)
    }
}

export const deleteSwDiscount = async(id)=>{
    try {
        const response = await axios.post(DefaultUrl+'delete/sw_discount/', {
            'id':id, 
        },
        {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
            }
        });
        console.log('delete:', response.data)
        return {'success':true, 'message':response.data.message}
    } catch (error) {
        console.error('Error delete sw_discount:', error);
        return {'success':false, 'message':error}
    };
}
