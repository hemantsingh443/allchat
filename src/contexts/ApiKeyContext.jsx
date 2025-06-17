import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext();

export const useApiKeys = () => useContext(ApiKeyContext);

export const ApiKeyProvider = ({ children }) => {
    
    const [userKeys, setUserKeys] = useState({ openrouter: '', tavily: '' });
    const [maximizeTokens, setMaximizeTokens] = useState(false);

    useEffect(() => {
        try {
            const storedKeys = localStorage.getItem('userApiKeys');
            if (storedKeys) {
                const parsedKeys = JSON.parse(storedKeys);
                setUserKeys(prev => ({...prev, ...parsedKeys}));
            }
            
            const storedMaximizeTokens = localStorage.getItem('maximizeTokens');
            if (storedMaximizeTokens) {
                setMaximizeTokens(JSON.parse(storedMaximizeTokens));
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

    const toggleMaximizeTokens = () => {
        const newValue = !maximizeTokens;
        setMaximizeTokens(newValue);
        localStorage.setItem('maximizeTokens', JSON.stringify(newValue));
    };

    return (
        <ApiKeyContext.Provider value={{ userKeys, updateApiKey, maximizeTokens, toggleMaximizeTokens }}>
            {children}
        </ApiKeyContext.Provider>
    );
};