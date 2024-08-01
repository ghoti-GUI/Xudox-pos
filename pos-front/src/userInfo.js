import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [Language, setLanguage] = useState(localStorage.getItem('Language') || 'English');
    const [Country, setCountry] = useState('Belgium');
    const [exportMode, setExportMode] = useState(localStorage.getItem('ExportMode') ||'folder')
  
    return (
        <UserContext.Provider value={{ 
            Language, setLanguage, 
            Country, setCountry, 
            exportMode, setExportMode, 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const Language = 'English'
export const Country = 'Belgium'