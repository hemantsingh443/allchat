import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext();

export const useApiKeys = () => useContext(ApiKeyContext);

export const ApiKeyProvider = ({ children }) => {
    
    const [userKeys, setUserKeys] = useState({ openrouter: '', tavily: '' });

    useEffect(() => {
        try {
            const storedKeys = localStorage.getItem('userApiKeys');
            if (storedKeys) {
               
                const parsedKeys = JSON.parse(storedKeys);
                setUserKeys(prev => ({...prev, ...parsedKeys}));
            }
        } catch (error) {
            console.error("Could not parse stored API keys:", error);
        }
    }, []);

    const updateApiKey = (service, key) => {
        const newKeys = { ...userKeys, [service]: key };
        setUserKeys(newKeys);
        localStorage.setItem('userApiKeys', JSON.stringify(newKeys));
    };

    return (
        <ApiKeyContext.Provider value={{ userKeys, updateApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};