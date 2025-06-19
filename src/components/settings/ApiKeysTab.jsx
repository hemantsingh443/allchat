import React, { useState, useEffect } from 'react';
import { useApiKeys } from '../../contexts/ApiKeyContext';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from '../../contexts/NotificationContext';
import { LoaderCircle, CheckCircle, XCircle, Trash2, Sparkles, AlertCircle, Key, Info } from 'lucide-react';
import SettingsCard from './SettingsCard';
import GlassPanel from '../GlassPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ToggleSwitch = ({ enabled, onChange, disabled }) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange()}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            } ${enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            disabled={disabled}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};

const ApiKeysTab = () => {
    const { userKeys, updateApiKey, maximizeTokens, toggleMaximizeTokens } = useApiKeys();
    const { getToken } = useAuth();
    const { addNotification } = useNotification();
    
    const maximizeTokensValue = maximizeTokens || false;
    const toggleMaximizeTokensFn = toggleMaximizeTokens || (() => console.log("toggleMaximizeTokens not available"));
    const hasOpenRouterKey = userKeys?.openrouter || false;
    
    const [openRouterKey, setOpenRouterKey] = useState('');
    const [tavilyKey, setTavilyKey] = useState('');
    const [googleKey, setGoogleKey] = useState('');
    const [orVerifying, setOrVerifying] = useState(false);
    const [tavilyVerifying, setTavilyVerifying] = useState(false);
    const [googleVerifying, setGoogleVerifying] = useState(false);
    const [orStatus, setOrStatus] = useState({ state: 'idle' });
    const [tavilyStatus, setTavilyStatus] = useState({ state: 'idle' });
    const [googleStatus, setGoogleStatus] = useState({ state: 'idle' });

    useEffect(() => {
        setOpenRouterKey(userKeys.openrouter || '');
        setTavilyKey(userKeys.tavily || '');
        setGoogleKey(userKeys.google || '');
        setOrStatus({ state: userKeys.openrouter ? 'success' : 'idle' });
        setTavilyStatus({ state: userKeys.tavily ? 'success' : 'idle' });
        setGoogleStatus({ state: userKeys.google ? 'success' : 'idle' });
    }, [userKeys]);

    const handleVerifyKey = async (keyType) => {
        const { key, setVerifying, setStatus, endpoint } = {
            openrouter: { key: openRouterKey, setVerifying: setOrVerifying, setStatus: setOrStatus, endpoint: '/api/verify-openrouter-key' },
            tavily: { key: tavilyKey, setVerifying: setTavilyVerifying, setStatus: setTavilyStatus, endpoint: '/api/verify-tavily-key' },
            google: { key: googleKey, setVerifying: setGoogleVerifying, setStatus: setGoogleStatus, endpoint: '/api/verify-google-key' }
        }[keyType];
        
        setVerifying(true);
        setStatus({ state: 'idle' });
        try {
            const clerkToken = await getToken();
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clerkToken}` },
                body: JSON.stringify({ apiKey: key })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || `Invalid ${keyType} Key`);
            updateApiKey(keyType, key);
            setStatus({ state: 'success', message: `Key verified!` });
            addNotification(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key verified and saved!`, 'success');
        } catch (error) {
            setStatus({ state: 'error', message: error.message });
            addNotification(error.message, 'error');
        } finally {
            setVerifying(false);
        }
    };
    
    const handleDeleteKey = (keyType) => {
        if (keyType === 'openrouter') {
            setOpenRouterKey('');
            setOrStatus({ state: 'idle' });
        } else if (keyType === 'tavily') {
            setTavilyKey('');
            setTavilyStatus({ state: 'idle' });
        } else if (keyType === 'google') {
            setGoogleKey('');
            setGoogleStatus({ state: 'idle' });
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <GlassPanel className="p-5 bg-indigo-500/5 dark:bg-indigo-800/10">
                <div >
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-2">API Key Management</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">
                        Your keys are stored securely in your browser and never sent to our servers.
                    </p>
                    
                    <div className="space-y-8">
                        {/* OpenRouter Key */}
                        <div className="border-t border-slate-200/60 dark:border-slate-700/50 pt-6">
                            <label htmlFor="openrouterKey" className="block text-base font-semibold text-slate-800 dark:text-gray-200">OpenRouter API Key</label>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">Required for paid models and advanced features.</p>
                            <div className="flex items-center gap-2">
                                <input id="openrouterKey" type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200" />
                                {userKeys.openrouter && (
                                    <button onClick={() => handleDeleteKey('openrouter')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={16}/></button>
                                )}
                                <button onClick={() => handleVerifyKey('openrouter')} disabled={orVerifying} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center gap-1.5">
                                    {orVerifying ? <LoaderCircle size={16} className="animate-spin" /> : 'Verify'}
                                </button>
                            </div>
                            <div className="h-4 mt-1">
                                {orStatus.state === 'error' && <p className="text-red-500 flex items-center gap-1.5 text-xs"><XCircle size={12} /> {orStatus.message}</p>}
                                {orStatus.state === 'success' && <p className="text-green-500 flex items-center gap-1.5 text-xs"><CheckCircle size={12} /> Key verified</p>}
                            </div>
                        </div>

                        {/* Tavily Key */}
                        <div className="border-t border-slate-200/60 dark:border-slate-700/50 pt-6">
                            <label htmlFor="tavilyKey" className="block text-base font-semibold text-slate-800 dark:text-gray-200">Tavily API Key</label>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">Enable real-time web search capabilities.</p>
                            <div className="flex items-center gap-2">
                                <input id="tavilyKey" type="password" value={tavilyKey} onChange={(e) => setTavilyKey(e.target.value)} placeholder="tvly-..." className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200" />
                                {userKeys.tavily && (
                                    <button onClick={() => handleDeleteKey('tavily')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={16}/></button>
                                )}
                                <button onClick={() => handleVerifyKey('tavily')} disabled={tavilyVerifying} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center gap-1.5">
                                    {tavilyVerifying ? <LoaderCircle size={16} className="animate-spin" /> : 'Verify'}
                                </button>
                            </div>
                            <div className="h-4 mt-1">
                                {tavilyStatus.state === 'error' && <p className="text-red-500 flex items-center gap-1.5 text-xs"><XCircle size={12} /> {tavilyStatus.message}</p>}
                                {tavilyStatus.state === 'success' && <p className="text-green-500 flex items-center gap-1.5 text-xs"><CheckCircle size={12} /> Key verified</p>}
                            </div>
                        </div>

                        {/* Google Key */}
                        <div className="border-t border-slate-200/60 dark:border-slate-700/50 pt-6">
                            <label htmlFor="googleKey" className="block text-base font-semibold text-slate-800 dark:text-gray-200">Google API Key</label>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">Required for premium Google Gemini models.</p>
                            <div className="flex items-center gap-2">
                                <input id="googleKey" type="password" value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} placeholder="Enter your Google API Key..." className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200" />
                                {userKeys.google && (
                                    <button onClick={() => handleDeleteKey('google')} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={16}/></button>
                                )}
                                <button onClick={() => handleVerifyKey('google')} disabled={googleVerifying} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center gap-1.5">
                                    {googleVerifying ? <LoaderCircle size={16} className="animate-spin" /> : 'Verify'}
                                </button>
                            </div>
                            <div className="h-4 mt-1">
                                {googleStatus.state === 'error' && <p className="text-red-500 flex items-center gap-1.5 text-xs"><XCircle size={12} /> {googleStatus.message}</p>}
                                {googleStatus.state === 'success' && <p className="text-green-500 flex items-center gap-1.5 text-xs"><CheckCircle size={12} /> Key verified</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </GlassPanel>
            <GlassPanel className="p-5 bg-rose-500/5 dark:bg-rose-800/10">
                <div >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-gray-100 text-base mb-1">
                                Maximize Token Capacity
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                Enable higher token limits for longer responses. (Requires OpenRouter key)
                            </p>
                        </div>
                        <ToggleSwitch 
                            enabled={maximizeTokensValue}
                            onChange={toggleMaximizeTokensFn}
                            disabled={!hasOpenRouterKey}
                        />
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};

export default ApiKeysTab; 