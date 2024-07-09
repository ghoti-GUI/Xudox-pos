import { RestaurantID } from "../userInfo"

export const categoryModel = {
    'name':'',
    'des':'',
    'time_supply':12,
    'Xu_class':'ab1.txt'
}

export const categoryModelFull = {
    ...categoryModel, 
    'color':'#FFFFFF',
    'text_color':'#000000',
    'img':'', 
    'rid':RestaurantID, 
}