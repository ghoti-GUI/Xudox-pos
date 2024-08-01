import React, { useContext } from 'react';
import { logout } from '../../service/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../userInfo';

const LogoutButton = () => {
    const navigate = useNavigate();
    // const Language = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const handleLogout = async()=>{
        const response = await logout();
        if(response.success){
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login')
        }else{
            toast.error(`Logout failed\nerror: ${response.message}`)
        }
    }

    return (
        <div className='flex justify-center items-center w-2/3'>
            <button 
                className='bg-buttonRed hover:bg-buttonRedHover rounded-2xl px-3'
                onClick={handleLogout}>
                {'Disconnection'}
            </button>
        </div>
    );
}

export default LogoutButton;
