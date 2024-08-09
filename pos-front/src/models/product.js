

export const addProductModelNormal = {
    'dinein_takeaway':1, 
    'id_Xu':'',
    'cid':'',
    'bill_content':'',
    'kitchen_content':'',
    'price':'',
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
    'cut_group':-1,
    'stb':0,
    'favourite':0,
    'soldout':0
}

export const addProductModelFull = {
    ...addProductModelNormal, 
    ...addProductModelAdvance, 
    'color':'rgb(255, 255, 255)',
    'text_color':'rgb(0, 0, 0)',
    'rid':0,
}