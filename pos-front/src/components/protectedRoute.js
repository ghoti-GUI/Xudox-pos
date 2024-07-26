import React,{ useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { token } from '../service/token';

const ProtectedRoute = ({ children }) => {
    // if user is not authenticated (no token available), the page will back to login
    const [isAuthenticated, setIsAuthenticated] = useState(token?true:false);
    
    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
