import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { login } from '../../service/auth';
import { multiLanguageText } from '../../multiLanguageText/multiLanguageText';
import { UserContext } from '../../userInfo';

const Login = () => {
    const navigate = useNavigate();
    // const Language = localStorage.getItem('Language') || 'English';
    const { Language } = useContext(UserContext);
    const Text = {...multiLanguageText}[Language].login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    // const { setRestaurantID } = useContext(UserContext);

    // 向后端发送认证请求
    const handleLogin = async (event) => {
        event.preventDefault();
        const response = await login({'username':username, 'password':password,});
        
        if(response.success){
            console.log(response)
            const accessToken = response.data.access;
            const refreshToken = response.data.refresh;
            const country = response.data.country;
            console.log('country:', country)
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('Country', country);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setMessage(Text.loginSucceed);
            setTimeout(() => {
                navigate('/pos/home');
            }, 500);
        }else{
            setMessage(Text.loginFailed);
        }
    };

    return (
        <div className='flex flex-col w-full h-screen justify-center items-center pb-20'>
            <h2 className='mb-5 text-2xl font-bold'>{Text.title}</h2>
            <form onSubmit={handleLogin} className='flex flex-col justify-center'>
                <div className='mb-2 flex flex-row justify-end'>
                    <label className='mr-1'>{Text.username}:</label>
                    <input
                        className='px-1 rounded'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className='mb-2 flex flex-row justify-end'>
                    <label className='mr-1'>{Text.password}:</label>
                    <input
                        className='px-1 rounded'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className='btn-bleu'>{Text.loginButton}</button>
            </form>
            <p className='text-red-500 my-2'>{message}</p>
        </div>
    );
};

export default Login;
