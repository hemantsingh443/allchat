import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from '../contexts/NotificationContext';
import { X, Info, LoaderCircle, CheckCircle, XCircle, Trash2, Settings, Key, Zap, Shield, Sparkles, AlertCircle, Brain, Globe, FileText, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ToggleSwitch = ({ enabled, onChange, disabled }) => {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange()}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
            } ${enabled ? 'bg-slate-600 dark:bg-slate-400 shadow-lg' : 'bg-slate-300/80 dark:bg-slate-600/80 backdrop-blur-sm'}`}
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

const SettingsModal = ({ isOpen, onClose }) => {
    const { userKeys, updateApiKey, maximizeTokens, toggleMaximizeTokens } = useApiKeys();
    const { getToken } = useAuth();
    const { addNotification } = useNotification();
    
    const maximizeTokensValue = maximizeTokens || false;
    const toggleMaximizeTokensFn = toggleMaximizeTokens || (() => console.log("toggleMaximizeTokens not available"));
    const hasOpenRouterKey = userKeys?.openrouter || false;
    
    const [openRouterKey, setOpenRouterKey] = useState('');
    const [tavilyKey, setTavilyKey] = useState('');
    const [orVerifying, setOrVerifying] = useState(false);
    const [tavilyVerifying, setTavilyVerifying] = useState(false);
    const [orStatus, setOrStatus] = useState({ state: 'idle' });
    const [tavilyStatus, setTavilyStatus] = useState({ state: 'idle' });

    const [tokenConfig, setTokenConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('api-keys');

    useEffect(() => {
        if (isOpen) {
            setOpenRouterKey(userKeys.openrouter || '');
            setTavilyKey(userKeys.tavily || '');
            setOrStatus({ state: userKeys.openrouter ? 'success' : 'idle' });
            setTavilyStatus({ state: userKeys.tavily ? 'success' : 'idle' });
            fetchTokenConfig();
        }
    }, [isOpen, userKeys]);

    const fetchTokenConfig = async () => {
        if (!getToken) return;
        try {
            const clerkToken = await getToken();
            const response = await fetch(`${API_URL}/api/chats/token-config`, {
                headers: { 'Authorization': `Bearer ${clerkToken}` }
            });
            if (response.ok) {
                const config = await response.json();
                setTokenConfig(config);
            }
        } catch (error) {
            console.error('Failed to fetch token config:', error);
        }
    };

    const handleVerifyKey = async (keyType) => {
        const key = keyType === 'openrouter' ? openRouterKey : tavilyKey;
        const setVerifying = keyType === 'openrouter' ? setOrVerifying : setTavilyVerifying;
        const setStatus = keyType === 'openrouter' ? setOrStatus : setTavilyStatus;
        const endpoint = keyType === 'openrouter' ? '/api/verify-openrouter-key' : '/api/verify-tavily-key';
        
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
        updateApiKey(keyType, '');
        if (keyType === 'openrouter') {
            setOpenRouterKey('');
            setOrStatus({ state: 'idle' });
        } else if (keyType === 'tavily') {
            setTavilyKey('');
            setTavilyStatus({ state: 'idle' });
        }
        addNotification(`${keyType.charAt(0).toUpperCase() + keyType.slice(1)} key removed.`, 'info');
    };

    const formatTokenCount = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    const tabs = [
        { id: 'api-keys', label: 'API Keys', icon: Key, description: 'Manage your API keys' },
        { id: 'token-limits', label: 'Token Limits', icon: Zap, description: 'Understand token usage' }
    ];

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel as={motion.div} className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/60 text-left align-middle shadow-2xl transition-all">
                                
                                {/* Header */}
                                <div className="relative p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100/90 dark:bg-slate-700/90 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                                                <Settings size={18} className="text-slate-600 dark:text-slate-300" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100">
                                    Settings
                                </Dialog.Title>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Configure your AI experience
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose} 
                                            className="p-1 rounded-md text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 transition-colors backdrop-blur-sm"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Navigation */}
                                <div className="px-4 pt-4">
                                    <div className="flex bg-slate-100/90 dark:bg-slate-900/70 p-1 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                                        {tabs.map(tab => (
                                            <button 
                                                key={tab.id} 
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'bg-white/90 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50'
                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                }`}
                                            >
                                                <tab.icon size={14} />
                                                <span>{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                        </div>

                                {/* Content */}
                                <div className="p-4">
                                    {activeTab === 'api-keys' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            {/* Info Card */}
                                            <div className="bg-slate-50/90 dark:bg-slate-800/70 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                <div className="flex items-start gap-2.5">
                                                    <Shield size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                        <h4 className="font-medium text-slate-800 dark:text-slate-200 text-xs mb-0.5">
                                                            Secure API Key Management
                                                        </h4>
                                                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug">
                                                            Your API keys are stored securely in your browser's local storage and are never sent to our servers. They're only used to authenticate with the respective services.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* API Keys */}
                                            <div className="space-y-4">
                                                {/* OpenRouter Key */}
                                                <div className="bg-slate-50/90 dark:bg-slate-800/70 p-4 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                    <h5 className="font-medium text-slate-800 dark:text-slate-200 text-sm">OpenRouter API Key</h5>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Required for paid models and advanced features</p>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." className="flex-1 px-3 py-1.5 text-xs rounded-md bg-white/90 dark:bg-slate-700/90 border border-slate-300/60 dark:border-slate-600/60 focus:ring-1 focus:ring-slate-500/50 focus:border-slate-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-colors backdrop-blur-sm" />
                                                            {userKeys.openrouter && (
                                                                <button onClick={() => handleDeleteKey('openrouter')} className="px-2.5 py-1.5 text-xs rounded-md bg-slate-200/90 hover:bg-slate-300/90 dark:bg-slate-700/90 dark:hover:bg-slate-600/90 text-slate-600 dark:text-slate-300 transition-colors backdrop-blur-sm">
                                                                    <Trash2 size={14}/>
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleVerifyKey('openrouter')} disabled={orVerifying} className="px-4 py-1.5 text-xs font-medium rounded-md bg-slate-800/90 text-slate-50 hover:bg-slate-700/90 dark:bg-slate-200/90 dark:text-slate-900 dark:hover:bg-slate-300/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 backdrop-blur-sm">
                                                                {orVerifying ? <LoaderCircle size={14} className="animate-spin" /> : 'Verify'}
                                                            </button>
                                                        </div>
                                                        <div className="h-4">
                                                            {orStatus.state === 'error' && <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 text-xs"><XCircle size={12} /> {orStatus.message}</p>}
                                                            {orStatus.state === 'success' && <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs"><CheckCircle size={12} /> Key verified and active</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Tavily Key */}
                                                <div className="bg-slate-50/90 dark:bg-slate-800/70 p-4 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                    <h5 className="font-medium text-slate-800 dark:text-slate-200 text-sm">Tavily API Key</h5>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Enable real-time web search capabilities</p>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input type="password" value={tavilyKey} onChange={(e) => setTavilyKey(e.target.value)} placeholder="tvly-..." className="flex-1 px-3 py-1.5 text-xs rounded-md bg-white/90 dark:bg-slate-700/90 border border-slate-300/60 dark:border-slate-600/60 focus:ring-1 focus:ring-slate-500/50 focus:border-slate-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-colors backdrop-blur-sm" />
                                                            {userKeys.tavily && (
                                                                <button onClick={() => handleDeleteKey('tavily')} className="px-2.5 py-1.5 text-xs rounded-md bg-slate-200/90 hover:bg-slate-300/90 dark:bg-slate-700/90 dark:hover:bg-slate-600/90 text-slate-600 dark:text-slate-300 transition-colors backdrop-blur-sm">
                                                                    <Trash2 size={14}/>
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleVerifyKey('tavily')} disabled={tavilyVerifying} className="px-4 py-1.5 text-xs font-medium rounded-md bg-slate-800/90 text-slate-50 hover:bg-slate-700/90 dark:bg-slate-200/90 dark:text-slate-900 dark:hover:bg-slate-300/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 backdrop-blur-sm">
                                                                {tavilyVerifying ? <LoaderCircle size={14} className="animate-spin" /> : 'Verify'}
                                                            </button>
                                                        </div>
                                                        <div className="h-4">
                                                            {tavilyStatus.state === 'error' && <p className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 text-xs"><XCircle size={12} /> {tavilyStatus.message}</p>}
                                                            {tavilyStatus.state === 'success' && <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs"><CheckCircle size={12} /> Key verified and active</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Maximize Tokens Feature */}
                                            <div className="bg-slate-50/90 dark:bg-slate-800/70 p-4 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1.5 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                            <Sparkles size={14} className="text-slate-600 dark:text-slate-300" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                                                                Maximize Token Capacity
                                                            </h4>
                                                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug">
                                                                Unlock maximum token limits for longer, more detailed responses when you have your own API key.
                                                            </p>
                                                            {!hasOpenRouterKey && (
                                                                <div className="flex items-center gap-2 mt-2 p-2 bg-slate-100/90 dark:bg-slate-700/70 rounded-md border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
                                                                    <AlertCircle size={12} className="text-slate-500 dark:text-slate-400" />
                                                                    <span className="text-xs text-slate-600 dark:text-slate-300">
                                                                        Requires an OpenRouter API key to enable
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ToggleSwitch 
                                                        enabled={maximizeTokensValue}
                                                        onChange={toggleMaximizeTokensFn}
                                                        disabled={!hasOpenRouterKey}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'token-limits' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            {/* How It Works Section */}
                                            <div className="bg-slate-50/90 dark:bg-slate-800/70 p-4 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-1.5 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                        <Info size={14} className="text-slate-600 dark:text-slate-300" />
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">How Token Limits Work</h4>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                                <Calculator size={12} className="text-slate-600 dark:text-slate-300" />
                                                            </div>
                                                            <h5 className="font-medium text-slate-700 dark:text-slate-300 text-xs">What are Tokens?</h5>
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug mb-2">
                                                            Tokens are the basic units of text that AI models process. Roughly 1 token = 4 characters in English. 
                                                            Your message + the AI's response together count toward the token limit.
                                                        </p>
                                                        <div className="bg-slate-50/90 dark:bg-slate-700/70 p-2 rounded-md backdrop-blur-sm border border-slate-200/60 dark:border-slate-600/60">
                                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                                <strong>Example:</strong> "Hello, how are you?" = ~5 tokens
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                                <Brain size={12} className="text-slate-600 dark:text-slate-300" />
                                                            </div>
                                                            <h5 className="font-medium text-slate-700 dark:text-slate-300 text-xs">How Limits Are Calculated</h5>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">Base Limit</p>
                                                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Starting point based on your account type</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">Model Adjustment</p>
                                                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Premium models get 75% of base, free models get 100%</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">Feature Reduction</p>
                                                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Web search reduces by 20%, streaming by 10%</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">Message Length</p>
                                                                    <p className="text-slate-600 dark:text-slate-400 text-xs">Longer inputs get shorter response limits</p>
                                                                </div>
                                                    </div>
                                                </div>
                                            </div>

                                                    <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                                <Sparkles size={12} className="text-slate-600 dark:text-slate-300" />
                                                            </div>
                                                            <h5 className="font-medium text-slate-700 dark:text-slate-300 text-xs">Special Cases</h5>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="p-2 bg-slate-100/90 dark:bg-slate-700/70 rounded-md border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">DeepSeek Models</span>
                                                                </div>
                                                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug">
                                                                    Generate both content AND reasoning, so they get higher limits (6k-25k tokens)
                                                                </p>
                                                            </div>
                                                            <div className="p-2 bg-slate-100/90 dark:bg-slate-700/70 rounded-md border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">Maximize Tokens</span>
                                                                </div>
                                                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug">
                                                                    When enabled with your API key: DeepSeek gets 25k, others get 15k tokens max
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-100/90 dark:bg-slate-700/70 p-3 rounded-md border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles size={12} className="text-slate-600 dark:text-slate-400" />
                                                            <h5 className="font-medium text-slate-700 dark:text-slate-300 text-xs">Pro Tip</h5>
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-snug">
                                                            Use the "Maximize Token Capacity" toggle in the API Keys tab to get much longer responses when you have your own API key.
                                                        </p>
                                                    </div>

                                                    <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="p-1 bg-slate-200/90 dark:bg-slate-600/90 rounded-md backdrop-blur-sm border border-slate-300/50 dark:border-slate-500/50">
                                                                <Globe size={12} className="text-slate-600 dark:text-slate-300" />
                                                            </div>
                                                            <h5 className="font-medium text-slate-700 dark:text-slate-300 text-xs">Real-World Examples</h5>
                                                        </div>
                                                        <div className="space-y-1.5 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600 dark:text-slate-400">Short response:</span>
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">~500 tokens</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600 dark:text-slate-400">Medium response:</span>
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">~1,500 tokens</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600 dark:text-slate-400">Long response:</span>
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">~3,000 tokens</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600 dark:text-slate-400">Detailed analysis:</span>
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">~5,000+ tokens</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {tokenConfig && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Current Token Limits</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {Object.entries(tokenConfig.tokenLimits).map(([userType, limits]) => (
                                                                <div key={userType} className="bg-slate-50/90 dark:bg-slate-800/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                                                                    <h5 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 capitalize">
                                                                        {userType.replace(/([A-Z])/g, ' $1').trim()}
                                                                    </h5>
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-slate-600 dark:text-slate-400 text-xs">Base:</span>
                                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatTokenCount(limits.base)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-slate-600 dark:text-slate-400 text-xs">Max:</span>
                                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatTokenCount(limits.max)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {tokenConfig.specialModels && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Special Model Configurations</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {Object.entries(tokenConfig.specialModels).map(([modelName, config]) => (
                                                                    <div key={modelName} className="bg-slate-100/90 dark:bg-slate-700/80 p-3 rounded-md border border-slate-200/60 dark:border-slate-600/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                                                                        <h5 className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1">{modelName}</h5>
                                                                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-2 leading-snug">{config.description}</p>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-slate-600 dark:text-slate-400 text-xs">Max Tokens:</span>
                                                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatTokenCount(config.maxTokens)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                        </div>
                                    </div>
                                )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SettingsModal;