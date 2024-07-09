import { RestaurantID } from "../userInfo"

export const addProductModelNormal = {
    'id_Xu':'',
    'cid':'',
    'bill_content':'',
    'kitchen_content':'',
    'price':'',
    'price2':'',
    'TVA_country':'',
    'TVA_category':1,
    'time_supply':12,
    'print_to_where':1,
    'Xu_class':'ab1.txt', 
}

export const addProductModelAdvance = {
    'id_user':'',
    'online_content':'',
    'online_des':'', 
    'product_type':0,
    'min_nbr':1,
    'discount':'', //database: '', 'b1g1f', '-10€', '-10%'
    'allergen':'',  
    'ename':'',
    'lname':'', 
    'fname':'', 
    'zname':'', 
    'edes':'',
    'ldes':'',
    'fdes':'',
    'stb':0,
    'favourite':0,
}

export const addProductModelFull = {
    ...addProductModelNormal, 
    ...addProductModelAdvance, 
    'color':'#FFFFFF',
    'text_color':'#000000',
    'img':'', 
    'rid':RestaurantID,
}