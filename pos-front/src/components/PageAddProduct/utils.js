import axios from "axios"
import { useState } from "react"
import { fetchAllCategory } from "../../service/category"


export const fetchAllCategoryForProductForm = async () => {
    try{
        const categoriesData = await fetchAllCategory()
        let categiriesDataForProductForm = {}
        categoriesData.forEach((category)=>{
            const name = category.ename || category.lname || category.fname || category.zname || category.name
            categiriesDataForProductForm[name] = category.id
        })
        return categiriesDataForProductForm
    }catch (error){
        console.error('Error fetching category data in addProduct.utils:', error)
    }
}

export const truncateString = (string, maxLength)=>{
    let length = 0;
    let result = '';
    for (let i = 0; i < string.length; i++) {
        if (string.charCodeAt(i) > 127) {
            length += 2;
        } else {
            length += 1;
        }

        if (length > maxLength) {
            break;
        }

        result += string[i];
    }

    return result
}