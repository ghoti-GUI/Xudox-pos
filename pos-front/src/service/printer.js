import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetPrinterUrl} from './valueDefault';




export const fetchPrinter = async () => {
    try {
      const response = await axios.get(DefaultUrl+GetPrinterUrl);
      const printDataList = Object.entries(response.data).map(([id, printer])=>{
        return{'id':id, 'printer':printer, 'checked':false}
      })
      return(printDataList); 
    } catch (error){
      console.error('Error fetching printer data:', error)
    }
  }