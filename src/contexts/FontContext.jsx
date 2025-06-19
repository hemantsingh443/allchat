import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const FONT_STORAGE_KEY = 'allchat-font-preference';

const fontOptions = [
    { id: 'font-sans', name: 'Geist', description: 'Clean and modern (Default)', tag: 'modern', family: 'font-sans' },
    { id: 'font-inter', name: 'Inter', description: 'Highly readable and versatile', tag: 'modern', family: 'font-inter' },
    { id: 'font-georgia', name: 'Georgia', description: 'Classic serif for readability', tag: 'classic', family: 'font-georgia' },
    { id: 'font-nunito', name: 'Nunito', description: 'Well-balanced rounded sans', tag: 'stylish', family: 'font-nunito' },
    { id: 'font-comfortaa', name: 'Comfortaa', description: 'Relaxed geometric with rounded edges', tag: 'stylish', family: 'font-comfortaa' },
    { id: 'font-kalam', name: 'Kalam', description: 'Handwriting with a personal touch', tag: 'artistic', family: 'font-kalam' },
    { id: 'font-orbitron', name: 'Orbitron', description: 'Futuristic geometric display', tag: 'artistic', family: 'font-orbitron' },
    { id: 'font-righteous', name: 'Righteous', description: 'Bold and impactful display', tag: 'artistic', family: 'font-righteous' },
];

const FontContext = createContext();

export const useFont = () => useContext(FontContext);

export const FontProvider = ({ children }) => {
    const [font, setFont] = useState(() => {
        // Check for saved font in localStorage, otherwise use default
        return localStorage.getItem(FONT_STORAGE_KEY) || 'font-sans';
    });

    useEffect(() => {
        // Save font to localStorage whenever it changes
        localStorage.setItem(FONT_STORAGE_KEY, font);
    }, [font]);

    // Apply the font class to the body element whenever it changes
    useEffect(() => {
        const body = document.body;
        // Remove any existing font classes
        fontOptions.forEach(option => {
            body.classList.remove(option.family);
        });
        // Add the currently selected font class
        if (font) {
            body.classList.add(font);
        }
    }, [font]);

    const value = useMemo(() => ({
        font,
        setFont,
        fontOptions,
    }), [font]);

    return (
        <FontContext.Provider value={value}>
            {children}
        </FontContext.Provider>
    );
}; 