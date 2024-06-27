import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetTVACountryUrl } from './valueDefault';



export const fetchTVA = async (language) =>{
    try {
      const response = await axios.get(DefaultUrl+GetTVACountryUrl, {
        params:{
          'language':language, 
        }
      });
      const TVAData = response.data; //Dutch: {21.00%: 1, 9.00%: 2, 0.00%: 3}
      // console.log(TVAData)
      return TVAData
    } catch (error){
      console.error('Error fetching TVA data:', error)
    }
  }

export const fetchTVAById = async (TVA_id, language) =>{
  try{
    const response = await axios.get(DefaultUrl+'get/tva/by_id/', {
      params:{
        'TVA_id':TVA_id, 
        'language':language, 
      }
    })
    const TVAData = response.data
    return TVAData
  }catch (error){
    console.error('Error fetching TVA data by id:', error)
  }
}