import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, GetTVACountryUrl } from './valueDefault';



export const fetchTVA = async (setTVA, setTVACountry, language) =>{
    try {
      const response = await axios.get(DefaultUrl+GetTVACountryUrl, {
        params:{
          'language':language, 
        }
      });
      const TVAData = response.data; //Dutch: {21.00%: 1, 9.00%: 2, 0.00%: 3}
      // console.log(TVAData)
      setTVA(TVAData); 
      const TVACountry = {}
      for (const country in TVAData){
        TVACountry[country]=country;
      }
      setTVACountry(TVACountry)
    } catch (error){
      console.error('Error fetching TVA data:', error)
    }
  }