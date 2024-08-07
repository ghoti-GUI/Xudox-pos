
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from './userInfo';
import './App.css';
import Login from './components/PageLogin/login';
import Pos from './Pos';
import { useEffect, useState } from 'react';

function App() {
    const [isAuth, setIsAuth] = useState(localStorage.getItem('access_token'));
    useEffect(() => {
        if (localStorage.getItem('access_token') !== null) {
            setIsAuth(true); 
        }
    }, [isAuth]);

    return (
        <UserProvider>
            <Router>
                <div className='flex bg-slate-200 w-full'>
                    {/* <Routes>
            <Route path='*'  element={<Navigate to='/pos' replace />}/>
            <Route path='/login'  element={<Login/>}/>
            <Route path='/pos/*'  element={
              <ProtectedRoute>
                <Pos/>
              </ProtectedRoute>
            }/>
          </Routes> */}
                    {!isAuth && <Routes>
                        <Route path='*'  element={<Navigate to='/login' replace />}/>
                        <Route path='/login'  element={<Login/>}/>
                    </Routes>}
                    {isAuth && <Routes>
                        <Route path='*'  element={<Navigate to='/pos/home' replace />}/>
                        <Route path='/pos/*'  element={<Pos/>}/>
                        <Route path='/login'  element={<Login/>}/>
                    </Routes>}
                </div>
                <ToastContainer
                    position="bottom-center"
                    autoClose={3000}
                    closeOnClick
                    pauseOnFocusLoss={false}/>
            </Router>
        </UserProvider>
    
    );
}

export default App;
