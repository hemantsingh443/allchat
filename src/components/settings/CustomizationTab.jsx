import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle, Edit } from 'lucide-react';
import { useFont } from '../../contexts/FontContext';
import SettingsCard from './SettingsCard';
import SectionWrapper from './SectionWrapper';
import GlassPanel from './GlassPanel'; 
import StyledPanel from './StyledPanel';
const FontCard = ({ fontInfo, isSelected, onSelect }) => {
    const tagColors = {
        modern: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        classic: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        stylish: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
        artistic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    };
    return (
        <button onClick={() => onSelect(fontInfo.family)} className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/10' : 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'}`}>
            {isSelected && <CheckCircle size={18} className="absolute top-3 right-3 text-blue-500" />}
            <div className="flex justify-between items-center mb-2">
                <h4 className={`text-lg font-semibold ${fontInfo.family} text-slate-800 dark:text-gray-200`}>{fontInfo.name}</h4>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tagColors[fontInfo.tag]}`}>{fontInfo.tag}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{fontInfo.description}</p>
            <div className={`space-y-1 ${fontInfo.family} p-3 rounded-md bg-slate-100/30 dark:bg-black/20`}>
                <p className="font-semibold text-slate-800 dark:text-gray-200">Hello! How can I help you today?</p>
                <p className="text-sm text-slate-600 dark:text-gray-400">This is how your messages will look with {fontInfo.name}.</p>
            </div>
        </button>
    )
};

const CustomizationTab = () => {
    const { font, setFont, fontOptions } = useFont();
    const [currentTheme, setCurrentTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setCurrentTheme('dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setCurrentTheme('light');
        }
    };
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <StyledPanel>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-2">Theme Settings</h2>
                <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                    Customize the visual appearance of AllChat.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-6 rounded-xl text-center transition-all duration-200 ${
                            currentTheme === 'light' 
                                ? 'ring-2 ring-blue-500 border-blue-500 bg-slate-200 dark:bg-slate-700' 
                                : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                    >
                        <Sun className="mx-auto mb-2 text-yellow-500" size={24} />
                        <h3 className="font-semibold text-slate-800 dark:text-gray-200">Light Mode</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">For bright environments</p>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-6 rounded-xl text-center transition-all duration-200 ${
                            currentTheme === 'dark' 
                                ? 'ring-2 ring-blue-500 border-blue-500 bg-slate-200 dark:bg-slate-700' 
                                : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                        }`}
                    >
                        <Moon className="mx-auto mb-2 text-indigo-400" size={24} />
                        <h3 className="font-semibold text-slate-800 dark:text-gray-200">Dark Mode</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">For low-light environments</p>
                    </button>
                </div>
            </StyledPanel>
            <SectionWrapper>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-6">Font Selection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fontOptions.map(fontInfo => (
                        <FontCard key={fontInfo.id} fontInfo={fontInfo} isSelected={font === fontInfo.family} onSelect={setFont} />
                    ))}
                </div>
            </SectionWrapper>
        </div>
    );
};

export default CustomizationTab; 