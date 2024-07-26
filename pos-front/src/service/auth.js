import axios from 'axios';
import { getCsrfToken } from './token';
import { DefaultUrl, CheckIdXuExistenceUrl, GetAllProduct, DefaultHost} from './valueDefault';
import { multiLanguageText } from '../multiLanguageText/multiLanguageText';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Language } from '../userInfo';


const Text = {...multiLanguageText}[Language];

const csrfToken = getCsrfToken();

export const login = async(userData)=>{
    try{
        const response = await axios.post(DefaultHost+'api/login/', 
            userData,
            {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
            }
        })
        // console.log(response.data)
        return {'success':true, 'data':response.data};
    }catch(error) {
        console.error('There was an error login!', error);
        return {'success':false, 'message':error};
    };
}

export const logout = async()=>{
    const refreshToken = localStorage.getItem('refresh_token');
    try{
        const response = await axios.post(DefaultHost+'api/login/', 
            {'refreshToken':refreshToken},
            {
            headers: {
                'X-CSRFToken': csrfToken, 
                'content-type': 'multipart/form-data', 
            }
        })
        console.log(response.data)
        return {'success':true, 'data':response.data};
    }catch(error) {
        console.error('There was an error login!', error);
        return {'success':false, 'message':error};
    };
}

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        console.error('No refresh token available');
    }
    try {
        const response = await axios.post(DefaultHost+'api/token/refresh/', {
            refresh: refreshToken,
        });
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error('Failed to refresh token');
    }
};