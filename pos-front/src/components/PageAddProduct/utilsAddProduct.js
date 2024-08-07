
import { fetchAllCategory } from "../../service/category"


export const fetchAllCategoryForProductForm = async (rid) => {
    try{
        const categoriesData = await fetchAllCategory(rid)
        let categiriesDataForProductForm = []
        categoriesData.forEach((category)=>{
            const name = category.ename || category.lname || category.fname || category.zname || category.name
            categiriesDataForProductForm.push({
                'name':name,
                'id':category.id,
                'Xu_class':category.Xu_class
            })
        })
        // console.log(categiriesDataForProductForm)
        return categiriesDataForProductForm
    }catch (error){
        console.error('Error fetching category data in addProduct.utils:', error)
    }
}