import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [Language, setLanguage] = useState('English');
  
    return (
        <UserContext.Provider value={{ Language, setLanguage }}>
            {children}
        </UserContext.Provider>
    );
};

export const Language = 'English'
export const Country = 'Belgium'