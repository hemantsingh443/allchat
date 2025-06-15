import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Sun, Moon, Code, Eye, Brain, Filter, X,
    BookOpen, Globe, Paperclip, ArrowUp, ChevronDown, Trash2, Info,
    LoaderCircle, CheckCircle, XCircle, Lightbulb
} from 'lucide-react';
import { useAppContext } from '../T3ChatUI';
import { useAuth } from '@clerk/clerk-react';
import GlassPanel from './GlassPanel';
import ChatMessage from './ChatMessage';
import { Transition, Dialog } from '@headlessui/react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { allModels, modelCategories } from '../data/models';
import { useNotification } from '../contexts/NotificationContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SettingsModal = ({ isOpen, onClose }) => {
    const { userKeys, updateApiKey } = useApiKeys();
    const { getToken } = useAuth();
    const { addNotification } = useNotification();

    const [openRouterKey, setOpenRouterKey] = useState('');
    const [tavilyKey, setTavilyKey] = useState('');
    const [orVerifying, setOrVerifying] = useState(false);
    const [tavilyVerifying, setTavilyVerifying] = useState(false);
    const [orStatus, setOrStatus] = useState({ state: 'idle' });
    const [tavilyStatus, setTavilyStatus] = useState({ state: 'idle' });

    useEffect(() => {
        if (isOpen) {
            setOpenRouterKey(userKeys.openrouter || '');
            setTavilyKey(userKeys.tavily || '');
            setOrStatus({ state: 'idle' });
            setTavilyStatus({ state: 'idle' });
        }
    }, [isOpen, userKeys]);

    const handleSaveOpenRouter = async () => {
        setOrVerifying(true);
        setOrStatus({ state: 'idle' });
        try {
            const clerkToken = await getToken();
            const res = await fetch(`${API_URL}/api/verify-openrouter-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clerkToken}` },
                body: JSON.stringify({ apiKey: openRouterKey })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Invalid OpenRouter Key');
            updateApiKey('openrouter', openRouterKey);
            setOrStatus({ state: 'success', message: 'OpenRouter key verified!' });
            addNotification('OpenRouter key verified and saved!', 'success');
        } catch (error) {
            setOrStatus({ state: 'error', message: error.message });
            addNotification(error.message, 'error');
        } finally {
            setOrVerifying(false);
        }
    };

    const handleSaveTavily = async () => {
        setTavilyVerifying(true);
        setTavilyStatus({ state: 'idle' });
        try {
            const clerkToken = await getToken();
            const res = await fetch(`${API_URL}/api/verify-tavily-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clerkToken}` },
                body: JSON.stringify({ apiKey: tavilyKey })
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Invalid Tavily Key');
            updateApiKey('tavily', tavilyKey);
            setTavilyStatus({ state: 'success', message: 'Tavily key verified!' });
            addNotification('Tavily key verified and saved!', 'success');
        } catch (error) {
            setTavilyStatus({ state: 'error', message: error.message });
            addNotification(error.message, 'error');
        } finally {
            setTavilyVerifying(false);
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

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel as={motion.div} className="w-full max-w-md transform text-left align-middle shadow-xl transition-all">
                                <GlassPanel className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
            <div>
                                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-gray-100">API Key Settings</Dialog.Title>
                                            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Keys are saved in your browser and never sent to us.</p>
                                        </div>
                                        <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10"><X size={20} /></button>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="openrouter-key" className="block text-sm font-medium text-slate-700 dark:text-gray-300">OpenRouter API Key</label>
                                        <div className="flex gap-2">
                                            <input type="password" id="openrouter-key" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." className="flex-grow px-3 py-2 text-sm rounded-lg border-slate-300/80 bg-slate-200/50 dark:bg-slate-900/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                                            {userKeys.openrouter && <button onClick={() => handleDeleteKey('openrouter')} className="px-3 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Trash2 size={16}/></button>}
                                            <button onClick={handleSaveOpenRouter} disabled={orVerifying} className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-24 flex items-center justify-center">{orVerifying ? <LoaderCircle size={18} className="animate-spin" /> : 'Verify'}</button>
                                        </div>
                                        <div className="h-5 text-sm">{orStatus.state === 'error' && <p className="text-red-500 flex items-center gap-1.5"><XCircle size={15} />{orStatus.message}</p>}{orStatus.state === 'success' && <p className="text-green-500 flex items-center gap-1.5"><CheckCircle size={15} />{orStatus.message}</p>}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="tavily-key" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Tavily API Key (for Web Search)</label>
                                        <div className="flex gap-2">
                                            <input type="password" id="tavily-key" value={tavilyKey} onChange={(e) => setTavilyKey(e.target.value)} placeholder="tvly-..." className="flex-grow px-3 py-2 text-sm rounded-lg border-slate-300/80 bg-slate-200/50 dark:bg-slate-900/50 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                                            {userKeys.tavily && <button onClick={() => handleDeleteKey('tavily')} className="px-3 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Trash2 size={16}/></button>}
                                            <button onClick={handleSaveTavily} disabled={tavilyVerifying} className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-24 flex items-center justify-center">{tavilyVerifying ? <LoaderCircle size={18} className="animate-spin" /> : 'Verify'}</button>
                                        </div>
                                        <div className="h-5 text-sm">{tavilyStatus.state === 'error' && <p className="text-red-500 flex items-center gap-1.5"><XCircle size={15} />{tavilyStatus.message}</p>}{tavilyStatus.state === 'success' && <p className="text-green-500 flex items-center gap-1.5"><CheckCircle size={15} />{tavilyStatus.message}</p>}</div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-black/20 dark:hover:bg-white/20">Close</button>
                                    </div>
                                </GlassPanel>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

const CapabilityIcons = ({ capabilities = {} }) => (
    <div className="flex items-center gap-2.5 text-slate-400">
        {capabilities.vision && <Eye size={15} className="text-green-400" title="Vision Enabled" />}
        {capabilities.reasoning && <Brain size={15} className="text-purple-400" title="Advanced Reasoning" />}
        {capabilities.code && <Code size={15} className="text-orange-400" title="Code Generation" />}
    </div>
);

const ModelSelectorModal = ({ isOpen, onClose, selectedModel, setSelectedModel, openSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { userKeys } = useApiKeys();
    const { addNotification } = useNotification();

    const handleSelectModel = (model) => {
        if (model.id.startsWith('google/') || userKeys.openrouter) {
            setSelectedModel(model.id);
            onClose();
        } else {
            addNotification('OpenRouter key required for this model.', 'warning');
            onClose();
            setTimeout(() => openSettings(), 150);
        }
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute bottom-20 right-4 sm:right-6 md:right-auto md:left-1/2 md:-translate-x-1/2">
                        <Transition.Child as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel as={motion.div} className="w-[340px] max-w-sm transform text-left align-middle transition-all">
                                <GlassPanel className="p-2">
                                    <div className="relative mb-2">
                                        <input
                                            type="text"
                                            placeholder="Filter models..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2 text-sm rounded-lg bg-white/40 dark:bg-black/20 border border-black/10 dark:border-white/10 text-slate-800 dark:text-gray-200 placeholder:text-slate-600 dark:placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {modelCategories.map((category) => {
                                            const lowerSearch = searchTerm.toLowerCase();
                                            const filteredModels = category.models.filter(m => m.name.toLowerCase().includes(lowerSearch));
                                            if (filteredModels.length === 0) return null;

                                            return (
                                                <div key={category.name}>
                                                    <h3 className="px-2 py-1 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase flex items-center gap-2">{category.logo} {category.name}</h3>
                                                    {filteredModels.map((model) => (
                                                        <button key={model.id} onClick={() => handleSelectModel(model)}
                                                            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150
                                                                ${selectedModel === model.id ? 'bg-blue-600 text-white' : 'text-slate-300 dark:text-gray-200 hover:bg-white/10'}`
                                                            }>
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-medium">{model.name}</span>
                                                                <Info size={14} className="text-slate-500" />
            </div>
                                                            <CapabilityIcons capabilities={model.capabilities} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )
                                        })}
                                    </div>
                    </GlassPanel>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
            </Transition>
    );
};

const SuggestionCard = ({ icon, title, description }) => (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="cursor-pointer">
        <GlassPanel className="p-4 h-full">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="font-semibold text-slate-800 dark:text-gray-200">{title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-gray-400">{description}</p>
        </GlassPanel>
    </motion.div>
);

const WelcomeScreen = () => (
    <div className="flex flex-col justify-center items-center h-full text-center py-10">
        <h2 className="text-5xl mb-12 font-medium text-slate-800 dark:text-gray-300">How can I help you?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            <SuggestionCard
                icon={<Lightbulb size={20} className="text-yellow-500" />}
                title="Brainstorm ideas"
                description="for my new YouTube channel about retro gaming"
            />
            <SuggestionCard
                icon={<Code size={20} className="text-orange-500" />}
                title="Write a script"
                description="in Python to automate my daily reports"
            />
            <SuggestionCard
                icon={<BookOpen size={20} className="text-blue-500" />}
                title="Summarize this text"
                description="from a long article I need to read for work"
            />
            <SuggestionCard
                icon={<Globe size={20} className="text-green-500" />}
                title="Plan a trip"
                description="for a 5-day hiking adventure in the mountains"
            />
        </div>
    </div>
);

const ImageViewerModal = ({ imageUrl, onClose }) => (
    <Transition appear show={!!imageUrl} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto" onClick={onClose}>
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel as="div" className="w-full max-w-4xl transform text-left align-middle shadow-xl transition-all">
                            <img src={imageUrl} alt="Full screen view" className="rounded-lg max-h-[90vh] w-auto h-auto mx-auto"/>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition>
);

const MainContent = () => {
    const { addNotification, getConfirmation } = useNotification(); // Get both functions
    const { activeChatId, setActiveChatId, getToken, setChats } = useAppContext();
    const { userKeys } = useApiKeys();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [selectedModel, setSelectedModel] = useState('google/gemini-1.5-flash-latest');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [viewingImageUrl, setViewingImageUrl] = useState(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const selectedModelDetails = allModels.find(m => m.id === selectedModel);

    const fetchMessages = useCallback(async (chatId) => {
        if (!chatId) {
            setMessages([]);
            setIsLoading(false);
            return;
        }
        setIsSwitching(true);
            try {
                const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
                if (!res.ok) throw new Error("Failed to fetch messages.");
                const data = await res.json();
            setMessages(data.map(msg => ({ ...msg, text: msg.content })));
            } catch (error) {
                console.error(error);
                addNotification(error.message, 'error');
                setMessages([{ id: 'error', text: 'Could not load this chat.', sender: 'ai' }]);
            } finally {
            setTimeout(() => setIsSwitching(false), 150);
        }
    }, [getToken, addNotification]);

    useEffect(() => {
        fetchMessages(activeChatId);
    }, [activeChatId, fetchMessages]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleEditAndResubmit = async (messageId, newContent) => {
        setIsLoading(true);
        const editIndex = messages.findIndex(m => m.id === messageId);
        if (editIndex !== -1) {
            const updatedUserMessage = {
                ...messages[editIndex],
                content: newContent,
                text: newContent,
                editCount: (messages[editIndex].editCount || 0) + 1,
            };
            setMessages([...messages.slice(0, editIndex), updatedUserMessage]);
        }
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chat/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ messageId, newContent, chatId: activeChatId, modelId: selectedModel, userApiKey: userKeys.openrouter })
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed to regenerate response.");
            fetchMessages(activeChatId);
        } catch (error) {
            console.error("Regeneration failed:", error);
            addNotification(`Error regenerating response: ${error.message}`, 'error');
            fetchMessages(activeChatId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setSelectedImage({ base64: base64String, mimeType: file.type });
                setImagePreviewUrl(URL.createObjectURL(file));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreviewUrl('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async () => {
        if ((!currentMessage.trim() && !selectedImage) || isLoading) return;
        
        const messageToSend = currentMessage;
        const oldMessages = [...messages];

        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: messageToSend,
            sender: 'user',
            imagePreviewUrl: imagePreviewUrl,
            usedWebSearch: isWebSearchEnabled,
        };

        const newMessagesForUI = [...oldMessages, optimisticMessage];
        const apiPayloadMessages = newMessagesForUI.map(msg => ({ role: 'user', content: msg.content }));

        setMessages(newMessagesForUI);
        setCurrentMessage('');
        setIsLoading(true);

        if (isWebSearchEnabled) {
            setIsSearchingWeb(true);
        }

        try {
            const token = await getToken();
            const body = {
                messages: apiPayloadMessages,
                chatId: activeChatId,
                modelId: selectedModel,
                userApiKey: userKeys.openrouter,
                userTavilyKey: userKeys.tavily,
                useWebSearch: isWebSearchEnabled,
            };

            if (selectedImage) {
                body.imageData = selectedImage.base64;
                body.imageMimeType = selectedImage.mimeType;
            }

            handleRemoveImage();
            setIsWebSearchEnabled(false);

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "An unknown error occurred.");
            }

            const finalUserMessage = {
                ...data.userMessage,
                text: data.userMessage.content,
                imagePreviewUrl: imagePreviewUrl,
                usedWebSearch: isWebSearchEnabled,
            };
            const finalAiMessage = {
                ...data.aiMessage,
                text: data.aiMessage.content
            };

            if (data.newChat) {
                setChats(p => [data.newChat, ...p]);
                setActiveChatId(data.newChat.id);
                setMessages([finalUserMessage, finalAiMessage]);
            } else {
                setMessages([...oldMessages, finalUserMessage, finalAiMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(oldMessages);
            setCurrentMessage(messageToSend);
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
            setIsSearchingWeb(false);
            handleRemoveImage();
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const toggleTheme = () => document.documentElement.classList.toggle('dark');

    const handleDeleteMessage = async (messageId) => {
        // --- THIS IS THE FIX ---
        const confirmed = await getConfirmation({
            title: "Delete Message",
            description: "Are you sure you want to delete this message? This will also remove the AI's response and cannot be undone.",
            confirmText: "Delete",
        });

        if (!confirmed) return; 

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to delete message.");
            }

            if (data.deletedIds && data.deletedIds.length > 0) {
                setMessages(prev => prev.filter(m => !data.deletedIds.includes(m.id)));
                addNotification('Message deleted.', 'info');
            }

            if (data.chatDeleted) {
                setChats(prev => prev.filter(c => c.id !== data.deletedChatId));
                if (activeChatId === data.deletedChatId) {
                    setActiveChatId(null);
                }
                addNotification('Chat deleted.', 'info');
            }

        } catch (error) {
            addNotification(error.message, 'error');
        }
    };

    return (
        <>
            <ImageViewerModal imageUrl={viewingImageUrl} onClose={() => setViewingImageUrl(null)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <ModelSelectorModal
                isOpen={isModelSelectorOpen}
                onClose={() => setIsModelSelectorOpen(false)}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                openSettings={() => setIsSettingsOpen(true)}
            />
        <div className="flex-1 flex flex-col h-full bg-white/50 dark:bg-black/30">
            <header className="flex justify-end items-center p-4">
                <div className="flex items-center gap-4">
                        <div onClick={() => setIsSettingsOpen(true)} className="transition-transform duration-200 ease-out hover:scale-110">
                            <GlassPanel className="p-2 rounded-full cursor-pointer">
                                <Settings className="text-slate-500 dark:text-gray-400" size={20} />
                            </GlassPanel>
                        </div>
                    <div className="transition-transform duration-200 ease-out hover:scale-110" onClick={toggleTheme}>
                        <GlassPanel className="p-2 rounded-full cursor-pointer">
                            <span className="dark:hidden"><Moon size={20} className="text-slate-500" /></span>
                            <span className="hidden dark:inline"><Sun size={20} className="text-gray-400" /></span>
                        </GlassPanel>
                    </div>
                </div>
            </header>
                <div
                    ref={chatContainerRef}
                    className={`flex-1 overflow-y-auto w-full transition-opacity duration-150 ${isSwitching ? 'opacity-0' : 'opacity-100'}`}
                >
                <div className="max-w-4xl mx-auto px-4 space-y-4 py-4">
                        {messages.length === 0 && !activeChatId && !isLoading && !isSwitching && (
                            <WelcomeScreen />
                    )}
                    <AnimatePresence>
                            {messages.map(msg =>
                                <ChatMessage
                                    key={msg.id}
                                    id={msg.id}
                                    text={msg.content}
                                    sender={msg.sender}
                                    editCount={msg.editCount}
                                    imageUrl={msg.imageUrl || msg.imagePreviewUrl}
                                    usedWebSearch={msg.usedWebSearch}
                                    handleUpdateMessage={handleEditAndResubmit}
                                    handleDeleteMessage={handleDeleteMessage}
                                    onImageClick={setViewingImageUrl}
                                />
                            )}
                    </AnimatePresence>

                        {isSearchingWeb && (
                            <div className="flex justify-start">
                                <GlassPanel className="p-3">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
                                        <Globe size={16} className="animate-pulse" />
                                        <span>Searching the web...</span>
                                    </div>
                                </GlassPanel>
                            </div>
                        )}

                        {isLoading && !isSearchingWeb && (
                        <div className="flex justify-start">
                                <GlassPanel className="p-3">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                </GlassPanel>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative z-10 px-4 pb-4 md:px-6 md:pb-6 pt-4">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-3xl mx-auto">
                        {imagePreviewUrl && (
                            <div className="mb-3 relative w-24 h-24">
                                <GlassPanel className="p-1 rounded-lg">
                                    <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-md"/>
                                </GlassPanel>
                                <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 border-2 border-slate-900 shadow-lg">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    <GlassPanel className="flex items-center gap-2 p-1.5">
                        <input
                                type="text"
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            placeholder="Type your message here..."
                            className="flex-1 bg-transparent px-3 py-2 text-md text-slate-700 placeholder:text-slate-500 dark:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsModelSelectorOpen(true)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-black/5 hover:bg-black/10 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 ring-2 ${selectedModel.startsWith('google/') ? 'ring-transparent' : (userKeys.openrouter ? 'ring-blue-500/80' : 'ring-red-500/80')}`}
                                >
                                    {selectedModelDetails?.name || 'Select Model'}
                                    <ChevronDown size={14} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                                    className={`p-2 rounded-lg transition-colors relative ${isWebSearchEnabled ? 'bg-blue-600/30 text-blue-400' : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                                    title="Toggle Web Search"
                                >
                                    <Globe size={18} className={isWebSearchEnabled ? '' : "text-slate-600 dark:text-gray-400"} />
                                    {isWebSearchEnabled && (
                                        <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-blue-500 text-white rounded-full px-1 py-0 leading-tight">
                                            {userKeys.tavily ? 'P' : 'D'}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg transition-colors bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                                >
                                    <Paperclip size={18} className="text-slate-600 dark:text-gray-400" />
                                </button>
                        </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || (!currentMessage.trim() && !selectedImage)}
                                className={`p-2 rounded-lg transition-all duration-300 ${(currentMessage.trim() || selectedImage) && !isLoading ? 'bg-slate-700 text-white' : 'bg-slate-200 dark:bg-gray-700 cursor-not-allowed'}`}
                            >
                            <ArrowUp size={20} />
                        </button>
                    </GlassPanel>
                </motion.div>
            </div>
        </div>
        </>
    );
};

export default MainContent;