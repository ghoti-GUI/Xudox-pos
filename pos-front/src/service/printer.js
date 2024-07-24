import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetPrinterUrl} from './valueDefault';
import { RestaurantID } from '../userInfo';




export const fetchPrinter = async (rid=RestaurantID) => {
    try {
      const response = await axios.get(DefaultUrl+GetPrinterUrl, {
        params:{
          'rid':rid, 
        }
      });
      const printDataList = Object.entries(response.data).map(([id, printer])=>{
        return{'id':id, 'printer':printer, 'checked':false}
      })
      return(printDataList); 
    } catch (error){
      console.error('Error fetching printer data:', error)
    }
  }

export const fetchPrintersById = async(printers_id, rid=RestaurantID)=>{
  try {
    const response = await axios.get(DefaultUrl+'get/printers/by_id/', {
      params:{
        'printers_id':printers_id, 
        'rid':rid, 
      }
    });
    const printDataList = response.data
    return(printDataList); 
  } catch (error){
    console.error('Error fetching printer data:', error)
  }
}