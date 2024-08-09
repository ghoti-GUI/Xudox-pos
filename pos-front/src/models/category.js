export const categoryModel = {
    'name':'',
    'des':'',
    'time_supply':12,
    'Xu_class':'ab1.txt'
}

export const categoryModelAdvance = {
    'ename':'',
    'lname':'',
    'fname':'',
    'zname':'',
    'edes':'',
    'ldes':'',
    'fdes':'',
}

export const categoryModelFull = {
    ...categoryModel, 
    ...categoryModelAdvance,
    'color':'rgb(255, 255, 255)',
    'text_color':'rgb(0, 0, 0)',
    'rid':0, 
}