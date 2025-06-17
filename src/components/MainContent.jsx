import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Sun, Moon, Code, Eye, Brain, Filter, X,
    BookOpen, Globe, Paperclip, ArrowUp, ChevronDown, Trash2, Info,
    LoaderCircle, CheckCircle, XCircle, Lightbulb, Maximize2, FileText, Sparkles, Search,
    FlaskConical, Rocket, BrainCircuit, HelpCircle
} from 'lucide-react';
import { useAppContext } from '../T3ChatUI';
import { useAuth } from '@clerk/clerk-react';
import GlassPanel from './GlassPanel';
import ChatMessage from './ChatMessage';
import { Transition, Dialog } from '@headlessui/react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { allModels, modelCategories } from '../data/models';
import { useNotification } from '../contexts/NotificationContext';
import ScrollToBottomButton from './ScrollToBottomButton';
import SettingsModal from './SettingsModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const GUEST_TRIAL_LIMIT = 8;
const GUEST_TRIAL_COUNT_KEY = 'allchat-guest-trials';


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
        if (model.id.startsWith('google/') || userKeys.openrouter || model.isFree) {
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
                                                                {model.isFree && (
                                                                    <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">
                                                                        Free Tier
                                                                    </span>
                                                                )}
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

const WelcomeScreen = ({ onSuggestionClick, user }) => {
    const greeting = user?.firstName ? `How can I help you, ${user.firstName}?` : "How can I help you?";

    const actionButtons = [
        { icon: <Sparkles size={16} />, label: "Create" },
        { icon: <Search size={16} />, label: "Explore" },
        { icon: <Code size={16} />, label: "Code" },
        { icon: <BookOpen size={16} />, label: "Learn" },
    ];

    const suggestionPrompts = [
        { 
            prompt: "Explain how AI works as if I were five years old", 
            icon: <BrainCircuit size={18} className="text-purple-500" /> 
        },
        { 
            prompt: "Are black holes real? And if so, what would happen if I fell into one?", 
            icon: <Rocket size={18} className="text-orange-500" /> 
        },
        { 
            prompt: "Give me a fun science experiment I can do at home with my kids", 
            icon: <FlaskConical size={18} className="text-green-500" /> 
        },
        { 
            prompt: "Write a short story about a robot learning to paint", 
            icon: <Sparkles size={18} className="text-blue-500" /> 
        },
        { 
            prompt: "What are the best practices for learning a new programming language?", 
            icon: <Code size={18} className="text-red-500" /> 
        },
        { 
            prompt: "How can I improve my productivity and time management?", 
            icon: <Brain size={18} className="text-green-500" /> 
        },
    ];

    return (
        <div className="flex flex-col justify-center items-center h-full text-center py-10 w-full max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 glass-text">
                {greeting}
            </h2>

            <div className="flex items-center gap-3 mb-10">
                {actionButtons.map((btn, index) => (
                    <motion.button 
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 dark:bg-black/10 backdrop-blur-sm border border-white/10 dark:border-white/5 text-slate-700 dark:text-gray-300 shadow-sm"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)', y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {btn.icon}
                        <span className="text-sm font-medium">{btn.label}</span>
                    </motion.button>
                ))}
            </div>

            <div className="w-full text-left space-y-2">
                {suggestionPrompts.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion.prompt)}
                        className="flex items-center gap-4 w-full text-left text-slate-600 dark:text-gray-400 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 + index * 0.05 } }}
                        whileHover={{ x: 5 }}
                    >
                        {suggestion.icon}
                        <span>{suggestion.prompt}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

const AttachmentPreview = ({ file, previewUrl, onRemove, onView }) => {
    const [isHovering, setIsHovering] = useState(false);

    if (!file) return null;

    return (
        <div 
            className="mb-3 relative inline-block"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {file.mimeType.startsWith('image/') ? (
                <GlassPanel className="p-1 rounded-lg overflow-hidden w-24 h-24">
                <div className="relative w-full h-full">
                    <img 
                            src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={onView}
                    />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovering ? 1 : 0 }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center"
                    >
                        <button 
                            onClick={onView}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                            title="View full size"
                        >
                            <Maximize2 size={20} />
                        </button>
                    </motion.div>
                </div>
            </GlassPanel>
            ) : (
                <GlassPanel className="p-2 rounded-lg flex items-center gap-3">
                    <FileText size={24} className="text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</span>
                </GlassPanel>
            )}

            <button 
                onClick={onRemove} 
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 border-2 border-slate-900 shadow-lg hover:bg-slate-700 transition-colors z-10"
            >
                <X size={16} />
            </button>
        </div>
    );
};

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

const SearchingIndicator = () => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: { delay: i * 0.2, repeat: Infinity, repeatType: "reverse", duration: 0.6 }
        })
    };
    return (
        <motion.div 
            className="flex justify-start my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <GlassPanel className="p-3">
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm">
                    <Globe size={16} />
                    <span>Searching the web</span>
                    <motion.div className="flex gap-1">
                        {[0, 1, 2].map(i => 
                            <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-1 h-1 bg-slate-500 dark:bg-gray-400 rounded-full" />
                        )}
                    </motion.div>
                </div>
            </GlassPanel>
        </motion.div>
    );
};

const PDFExtractionIndicator = ({ fileName }) => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: { delay: i * 0.2, repeat: Infinity, repeatType: "reverse", duration: 0.6 }
        })
    };
    return (
        <motion.div 
            className="flex justify-start my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <GlassPanel className="p-3">
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm">
                    <FileText size={16} />
                    <span>Extracting PDF content{fileName ? `: ${fileName}` : ''}</span>
                    <motion.div className="flex gap-1">
                        {[0, 1, 2].map(i => 
                            <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-1 h-1 bg-slate-500 dark:bg-gray-400 rounded-full" />
                        )}
                    </motion.div>
                </div>
            </GlassPanel>
        </motion.div>
    );
};

const ImageProcessingIndicator = ({ fileName }) => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: { delay: i * 0.2, repeat: Infinity, repeatType: "reverse", duration: 0.6 }
        })
    };
    return (
        <motion.div 
            className="flex justify-start my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <GlassPanel className="p-3">
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm">
                    <Eye size={16} />
                    <span>Processing image{fileName ? `: ${fileName}` : ''}</span>
                    <motion.div className="flex gap-1">
                        {[0, 1, 2].map(i => 
                            <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-1 h-1 bg-slate-500 dark:bg-gray-400 rounded-full" />
                        )}
                    </motion.div>
                </div>
            </GlassPanel>
        </motion.div>
    );
};

const CustomTooltip = ({ children, text, isGuest }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                    >
                        <GlassPanel className="px-3 py-1.5 text-xs whitespace-nowrap">
                            <span className={`${isGuest ? 'text-red-400' : 'text-slate-600 dark:text-gray-300'}`}>
                                {text}
                            </span>
                        </GlassPanel>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white/10 dark:bg-black/10 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MainContent = () => {
    const { chats, setChats, activeChatId, setActiveChatId, getToken, getConfirmation, isGuest, handleSignIn } = useAppContext();
    const { userKeys, maximizeTokens } = useApiKeys();
    const { addNotification } = useNotification();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [newChatModelId, setNewChatModelId] = useState('google/gemini-1.5-flash-latest');
    const [isLoading, setIsLoading] = useState(false); // General loading for non-streaming parts
    const [isSwitching, setIsSwitching] = useState(false); // For chat switching visual
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState('');
    const [viewingImageUrl, setViewingImageUrl] = useState(null);
    const [isExtractingPDF, setIsExtractingPDF] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false); // Specifically for streaming active
    
    const [streamingMessageContent, setStreamingMessageContent] = useState({});
    
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isAtBottomRef = useRef(true);

    const activeChatIdRef = useRef(activeChatId); 
    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);


    const [guestTrials, setGuestTrials] = useState(() => {
        const stored = localStorage.getItem(GUEST_TRIAL_COUNT_KEY);
        return stored ? parseInt(stored, 10) : 0;
    });

    useEffect(() => {
        console.log("[MainContent] Messages state updated:", JSON.parse(JSON.stringify(messages)));
    }, [messages]);

    useEffect(() => {
        console.log("[MainContent] StreamingMessageContent updated:", streamingMessageContent);
    }, [streamingMessageContent]);

    useEffect(() => {
        console.log("[MainContent] ActiveChatId changed in state:", activeChatId);
    }, [activeChatId]);
    
    useEffect(() => {
        console.log(`[MainContent] isLoading: ${isLoading}, isStreaming: ${isStreaming}`);
    }, [isLoading, isStreaming]);


    const handleSuggestionClick = (prompt) => {
        setCurrentMessage(prompt);
        setTimeout(() => {
            document.getElementById('send-button')?.click();
        }, 50);
    };

    const handleSearchSuggestionClick = (suggestion) => {
        if (!isWebSearchEnabled) {
            setIsWebSearchEnabled(true);
        }
        setCurrentMessage(suggestion);
        setTimeout(() => {
            document.getElementById('send-button')?.click();
        }, 50);
    };

    useEffect(() => {
        if (isGuest) {
            localStorage.setItem(GUEST_TRIAL_COUNT_KEY, guestTrials);
        }
    }, [guestTrials, isGuest]);

    const checkGuestTrial = useCallback(() => {
        if (guestTrials >= GUEST_TRIAL_LIMIT) {
            addNotification('You have reached the guest trial limit. Please sign in to continue.', 'error');
            setTimeout(handleSignIn, 1500);
            return false;
        }
        const newCount = guestTrials + 1;
        setGuestTrials(newCount);
        if (GUEST_TRIAL_LIMIT - newCount <= 2 && GUEST_TRIAL_LIMIT - newCount > 0) {
            addNotification(`You have ${GUEST_TRIAL_LIMIT - newCount} trials remaining.`, 'info');
        }
        return true;
    }, [guestTrials, addNotification, handleSignIn]);

    const activeChat = useMemo(() => chats.find(c => c.id === activeChatIdRef.current), [chats, activeChatId]); // Use activeChatId for re-memo, ref inside for value
    const currentChatModelId = activeChat?.modelId || newChatModelId;
    
    const currentModelDetails = allModels.find(m => m.id === currentChatModelId);
    const needsUserKey = currentModelDetails && !currentModelDetails.id.startsWith('google/') && !currentModelDetails.isFree;
    const hasUserKey = !!userKeys.openrouter;

    useEffect(() => {
        if (isGuest && currentModelDetails && !currentModelDetails.isFree) {
            const freeModel = allModels.find(m => m.isFree);
            if (freeModel) {
                if (activeChat) {
                    setChats(prev => prev.map(c => 
                        c.id === activeChatIdRef.current ? {...c, modelId: freeModel.id} : c
                    ));
                } else {
                    setNewChatModelId(freeModel.id);
                }
                addNotification(`Switched to free model: ${freeModel.name}`, 'info');
            }
        }
    }, [isGuest, currentModelDetails, activeChat, setChats, addNotification, setNewChatModelId]); // activeChatId removed, activeChat used

    const fetchMessages = useCallback(async (chatIdToFetch) => {
        console.log("[FetchMessages] Called for chatIdToFetch:", chatIdToFetch);
    
        if (isLoading || isStreaming) {
            console.log("[FetchMessages] Aborted: isLoading or isStreaming is true for chatId:", activeChatIdRef.current);
            return;
        }
    
        if (!chatIdToFetch) {
            console.log("[FetchMessages] chatIdToFetch is null, clearing messages for new chat.");
            setMessages([]);
            setIsLoading(false);
            setIsSwitching(false);
            return;
        }
        
        // Only set switching if it's a different chat ID than current
        // or if messages are empty for current (might happen on initial load of an existing chat)
        if (chatIdToFetch !== activeChatIdRef.current || messages.length === 0) {
            setIsSwitching(true);
        }
    
        if (isGuest) {
            const guestChat = chats.find(c => c.id === chatIdToFetch);
            console.log("[FetchMessages] Guest mode, guestChat:", guestChat);
            setMessages(guestChat?.messages || []);
            setTimeout(() => setIsSwitching(false), 50); // Short delay for visual feedback
            return;
        }
    
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatIdToFetch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Failed to fetch messages. Status: ${res.status}`);
            const data = await res.json();
            console.log("[FetchMessages] Fetched data for", chatIdToFetch, ":", data);
            setMessages(data.map(msg => ({ 
                ...msg, 
                text: msg.content, 
                searchResults: msg.searchResults || null
            })));
        } catch (error) {
            console.error("[FetchMessages] Error for", chatIdToFetch, ":", error);
            addNotification(error.message, 'error');
            setMessages([{ id: 'error-' + chatIdToFetch, text: 'Could not load this chat.', sender: 'ai', content: 'Could not load this chat.' }]);
        } finally {
            setTimeout(() => {
                setIsSwitching(false);
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 150);
        }
    }, [isGuest, chats, getToken, addNotification, messages.length, isLoading, isStreaming]); // Added isLoading, isStreaming

    useEffect(() => {
        console.log("[useEffect activeChatId] Changed to:", activeChatId, "Calling fetchMessages if not loading/streaming.");
        if (!isLoading && !isStreaming) { // Guard fetchMessages
            fetchMessages(activeChatId);
        } else {
            console.log("[useEffect activeChatId] Skipped fetchMessages due to isLoading/isStreaming.");
        }
    }, [activeChatId, fetchMessages, isLoading, isStreaming]);


    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isStreaming) { // Scroll only on new, complete messages
            if (isAtBottomRef.current) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 20;
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    
    const processStream = useCallback(async (response, streamTargetId, optimisticUserMessageId) => {
        console.log("[ProcessStream] Called for streamTargetId:", streamTargetId, "optimisticUserMessageId:", optimisticUserMessageId);
        if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({error: 'Streaming request failed with status ' + response.status}));
            console.error("[ProcessStream] Response not OK or no body:", errorData.error);
            addNotification(errorData.error || 'Streaming request failed', 'error');
            throw new Error(errorData.error || 'Streaming request failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentContentAccumulator = { content: '', reasoning: '' };
        let receivedNewChatInfo = null; 

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("[ProcessStream] Stream finished for streamTargetId:", streamTargetId);
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            let boundary = buffer.indexOf('\n');
            while (boundary !== -1) {
                const line = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);

                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        const scrollToBottomIfNeeded = () => {
                            if (isAtBottomRef.current && chatContainerRef.current) {
                                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                            }
                        };
                        
                        switch (data.type) {
                            case 'chat_info':
                                console.log("[ProcessStream] Received chat_info:", data);
                                if (data.newChat) {
                                    receivedNewChatInfo = data.newChat; 
                                    setChats(p => {
                                        if (p.find(chat => chat.id === data.newChat.id)) return p;
                                        return [data.newChat, ...p];
                                    });
                                    setActiveChatId(data.newChat.id); 
                                }
                                if (optimisticUserMessageId && data.userMessage) {
                                    setMessages(prevMsgs =>
                                        prevMsgs.map(msg =>
                                            msg.id === optimisticUserMessageId
                                                ? { ...data.userMessage, text: data.userMessage.content }
                                                : msg
                                        )
                                    );
                                }
                                break;
                            case 'content_word':
                                currentContentAccumulator.content += data.content;
                                setStreamingMessageContent(prev => ({ 
                                    ...prev, 
                                    [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator } 
                                }));
                                scrollToBottomIfNeeded();
                                break;
                            case 'reasoning_word':
                                currentContentAccumulator.reasoning += data.content;
                                 setStreamingMessageContent(prev => ({ 
                                     ...prev, 
                                     [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator } 
                                 }));
                                scrollToBottomIfNeeded();
                                break;
                            case 'complete':
                                console.log("[ProcessStream] Received complete event:", data);
                                if (data.aiMessage) {
                                    const finalAiMsg = { ...data.aiMessage, text: data.aiMessage.content, isStreaming: false };
                                    setMessages(prevMsgs => prevMsgs.map(msg => 
                                        msg.id === streamTargetId 
                                            ? finalAiMsg
                                            : msg
                                    ));
                                    
                                    if (receivedNewChatInfo && receivedNewChatInfo.id === data.chatId) {
                                        setChats(prevChats => prevChats.map(chat => {
                                            if (chat.id === receivedNewChatInfo.id) {
                                                const userMsgFromChatInfo = messages.find(m => m.id === optimisticUserMessageId && m.chatId === receivedNewChatInfo.id) || 
                                                                          messages.find(m => m.chatId === receivedNewChatInfo.id && m.sender === 'user');
                                                
                                                let newChatMessages = [];
                                                if (userMsgFromChatInfo) newChatMessages.push(userMsgFromChatInfo);
                                                newChatMessages.push(finalAiMsg);
                                                
                                                return { ...chat, messages: newChatMessages.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)) };
                                            }
                                            return chat;
                                        }));
                                    }
                                }
                                reader.cancel();
                                return; 
                            case 'error':
                                console.error("[ProcessStream] Received error event from server:", data.error);
                                addNotification(`Server error: ${data.error}`, 'error');
                                throw new Error(data.error); 
                        }
                    } catch (e) {
                        console.error('[ProcessStream] Error parsing streaming data line or processing event:', line, e);
                    }
                }
                boundary = buffer.indexOf('\n');
            }
        }
    }, [setChats, setActiveChatId, setMessages, addNotification, messages]); // Added messages to deps for chat_info userMsg


    const handleStreamingRequest = useCallback(async (endpoint, body, streamTargetId, optimisticUserMessageId) => {
        console.log("[HandleStreamingRequest] Called. Endpoint:", endpoint, "streamTargetId:", streamTargetId);
        // Set visual indicators based on body content if needed (e.g., useWebSearch, fileMimeType)
        if (body.useWebSearch) setIsSearchingWeb(true);
        if (body.fileMimeType === 'application/pdf') setIsExtractingPDF(true);
        if (body.fileMimeType?.startsWith('image/')) setIsProcessingImage(true);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            console.log("[HandleStreamingRequest] Fetch response received, status:", response.status);
            await processStream(response, streamTargetId, optimisticUserMessageId);
        } catch (error) {
            console.error('[HandleStreamingRequest] Streaming error:', error);
            addNotification(error.message || 'An error occurred during streaming.', 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId && (optimisticUserMessageId ? m.id !== optimisticUserMessageId : true) ));
        } finally {
            console.log("[HandleStreamingRequest] Finally block for streamTargetId:", streamTargetId);
            setIsLoading(false); // Request is done
            setIsStreaming(false); // Streaming phase is over
            setIsSearchingWeb(false); // Clear visual indicators
            setIsExtractingPDF(false);
            setIsProcessingImage(false);
            setStreamingMessageContent(prev => {
                const { [streamTargetId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [getToken, addNotification, processStream, setMessages]); 

    const handleStreamingRegeneration = useCallback(async (
        userMessageIdToRegenFrom, 
        newContentForUserMessage, 
        streamTargetId,           
        modelIdToUse,
        shouldUseWebSearch
    ) => {
        console.log("[HandleStreamingRegeneration] Called. userMessageIdToRegenFrom:", userMessageIdToRegenFrom, "streamTargetId:", streamTargetId);
        setIsLoading(true); // Indicate activity
        setIsStreaming(true);
        await handleStreamingRequest(
            '/api/chat/regenerate/stream',
            {
                messageId: userMessageIdToRegenFrom, 
                newContent: newContentForUserMessage,    
                chatId: activeChatIdRef.current, 
                modelId: modelIdToUse,
                useWebSearch: shouldUseWebSearch,
                userApiKey: userKeys.openrouter,
                userTavilyKey: userKeys.tavily,
                maximizeTokens: maximizeTokens,
            },
            streamTargetId, 
            userMessageIdToRegenFrom 
        );
    }, [userKeys.openrouter, userKeys.tavily, handleStreamingRequest, maximizeTokens]);

    const streamGuestResponse = useCallback(async (messagesForAI, streamTargetId, modelIdToUse) => {
        console.log("[StreamGuestResponse] Called. streamTargetId:", streamTargetId, "Messages for AI:", messagesForAI);
        setIsLoading(true); // Indicate activity
        setIsStreaming(true);
        try {
            const body = {
                messages: messagesForAI, 
                modelId: modelIdToUse,
            };

            const response = await fetch(`${API_URL}/api/chat/guest/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            console.log("[StreamGuestResponse] Fetch response status:", response.status);
            
            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({error: 'Guest stream request failed'}));
                console.error("[StreamGuestResponse] Error response from server:", errorData);
                throw new Error(errorData.error);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentContentAccumulator = { content: '', reasoning: '' };

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("[StreamGuestResponse] Stream finished for streamTargetId:", streamTargetId);
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                let boundary;
                while ((boundary = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 1);

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const scrollToBottomIfNeeded = () => {
                                if (isAtBottomRef.current && chatContainerRef.current) {
                                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                                }
                            };
                            if (data.type === 'complete') {
                                console.log("[StreamGuestResponse] Received complete event.");
                                reader.cancel();
                                break; 
                            }
                            if (data.type === 'content_word') {
                                currentContentAccumulator.content += data.content;
                                setStreamingMessageContent(prev => ({
                                    ...prev,
                                    [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator }
                                }));
                                scrollToBottomIfNeeded();
                            }
                            if (data.type === 'reasoning_word') { 
                                currentContentAccumulator.reasoning += data.content;
                                 setStreamingMessageContent(prev => ({
                                    ...prev,
                                    [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator }
                                }));
                                scrollToBottomIfNeeded();
                            }
                            if (data.type === 'error') {
                                console.error("[StreamGuestResponse] Received error event from server:", data.error);
                                addNotification(`Server error: ${data.error}`, 'error');
                                throw new Error(data.error);
                            }
                        } catch (e) { 
                            console.error('[StreamGuestResponse] Error parsing streaming data line:', line, e);
                        }
                    }
                }
            }
            
            const finalAiMessage = { 
                id: streamTargetId, 
                sender: 'ai', 
                role: 'ai', // Add role for consistency
                content: currentContentAccumulator.content,
                text: currentContentAccumulator.content, 
                reasoning: currentContentAccumulator.reasoning,
                createdAt: new Date().toISOString(), 
                modelId: modelIdToUse,
                isStreaming: false
            };
            console.log("[StreamGuestResponse] Finalizing guest AI message:", finalAiMessage);

            setMessages(prevLocalMessages => {
                const updatedLocalMessages = prevLocalMessages.map(m => m.id === streamTargetId ? finalAiMessage : m);
                const currentActiveChatIdVal = activeChatIdRef.current;

                if (!currentActiveChatIdVal || !chats.find(c => c.id === currentActiveChatIdVal)) {
                     const newChatId = `guest-chat-${Date.now()}`;
                     const newChat = {
                        id: newChatId,
                        title: (updatedLocalMessages[0]?.content || updatedLocalMessages[0]?.text || "New Guest Chat").substring(0, 30) ,
                        createdAt: new Date().toISOString(),
                        modelId: modelIdToUse,
                        messages: updatedLocalMessages, 
                    };
                    console.log("[StreamGuestResponse] Creating new guest chat locally:", newChat);
                    setChats(prevChats => [newChat, ...prevChats]);
                    setActiveChatId(newChatId); 
                } else {
                    setChats(prevChats => prevChats.map(c => 
                        c.id === currentActiveChatIdVal 
                        ? { ...c, messages: updatedLocalMessages } 
                        : c
                    ));
                }
                return updatedLocalMessages; 
            });


        } catch (error) {
            console.error("[StreamGuestResponse] Error:", error);
            addNotification(error.message, 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId)); 
        } finally {
            console.log("[StreamGuestResponse] Finally block for streamTargetId:", streamTargetId);
            setIsLoading(false);
            setIsStreaming(false);
            setStreamingMessageContent(prev => {
                const { [streamTargetId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [addNotification, setChats, setActiveChatId, setMessages, chats]);


    const handleEditAndResubmit = useCallback(async (userMessageId, newContent) => {
        console.log("[HandleEditAndResubmit] Called. UserMessageId:", userMessageId, "NewContent:", newContent);
        const messageIndex = messages.findIndex(m => m.id === userMessageId);
        if (messageIndex === -1) {
            console.error("[HandleEditAndResubmit] Original user message not found.");
            return;
        }

        const updatedUserMessageForDisplay = {
            ...messages[messageIndex],
            content: newContent,
            text: newContent, 
            editCount: (messages[messageIndex].editCount || 0) + 1,
        };
        
        const history = messages.slice(0, messageIndex);
        const messagesForDisplay = [...history, updatedUserMessageForDisplay];

        if (isGuest) {
            if (!checkGuestTrial()) return;
            const streamTargetId = `guest-streaming-ai-${Date.now()}`;
            const placeholderAiMessage = {
                id: streamTargetId, sender: 'ai', role: 'ai', content: '',text:'', reasoning: '', isStreaming: true, modelId: currentChatModelId
            };
            
            const allMessagesForGuestCall = [...messagesForDisplay, placeholderAiMessage];
            setMessages(allMessagesForGuestCall);
            
            const messagesForAIGuest = messagesForDisplay.map(m => ({sender: m.sender || m.role, content: m.content}));

            await streamGuestResponse(messagesForAIGuest, streamTargetId, currentChatModelId); 
            return;
        }
            
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = {
            id: streamTargetId, sender: 'ai', role: 'ai', text: '', content:'', reasoning: '', isStreaming: true, modelId: currentChatModelId
        };

        setMessages([...messagesForDisplay, placeholderAiMessage]);

        const originalUserMessageFromState = messages[messageIndex];
        const shouldUseWebSearch = originalUserMessageFromState.usedWebSearch || false; 

        await handleStreamingRegeneration(
            userMessageId,      
            newContent,         
            streamTargetId,     
            currentChatModelId,
            shouldUseWebSearch
        );
    }, [messages, isGuest, checkGuestTrial, currentChatModelId, handleStreamingRegeneration, streamGuestResponse, setMessages]);


    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                    setSelectedFile({ base64: base64String, mimeType: file.type, name: file.name });
                    if (file.type.startsWith('image/')) { 
                        setFilePreviewUrl(URL.createObjectURL(file));
                    } else {
                        setFilePreviewUrl(''); 
                    }
            };
            reader.readAsDataURL(file);
            } else {
                addNotification('Unsupported file. Please select an image or PDF.', 'error');
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreviewUrl('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    const handleSendMessage = async () => {
        console.log("[HandleSendMessage] Called. CurrentMessage:", currentMessage, "SelectedFile:", selectedFile, "Current activeChatId:", activeChatIdRef.current);
        if ((!currentMessage.trim() && !selectedFile) || isLoading || isStreaming) {
            console.log("[HandleSendMessage] Aborted: Empty message or already loading/streaming.");
            return;
        }
    
        setIsLoading(true); // Set loading true at the beginning of the send process
        setIsStreaming(true); // Expecting a stream

        const messageContentToSend = currentMessage;
        const currentActiveChatIdVal = activeChatIdRef.current; 
    
        if (isGuest) {
            if (selectedFile) {
                addNotification('File attachments are not available in guest mode. Please sign in.', 'error');
                setIsLoading(false); setIsStreaming(false); return;
            }
            if (isWebSearchEnabled) {
                addNotification('Web search is not available in guest mode. Please sign in.', 'error');
                setIsLoading(false); setIsStreaming(false); return;
            }
            if (!checkGuestTrial()) {
                setIsLoading(false); setIsStreaming(false); return;
            }
    
            const optimisticUserMessage = {
                id: `guest-msg-${Date.now()}`,
                content: messageContentToSend,
                text: messageContentToSend, 
                sender: 'user', 
                role: 'user',
                createdAt: new Date().toISOString()
            };
            const streamTargetId = `guest-streaming-ai-${Date.now()}`;
            const placeholderAiMessage = {
                id: streamTargetId, sender: 'ai', role: 'ai', content: '', text:'', reasoning: '', isStreaming: true, modelId: currentChatModelId
            };
            
            const baseMessages = currentActiveChatIdVal && chats.find(c=>c.id === currentActiveChatIdVal) 
                               ? messages 
                               : []; // If new guest chat, start with empty base messages
            const newDisplayMessages = [...baseMessages, optimisticUserMessage, placeholderAiMessage];

            setMessages(newDisplayMessages);
            setCurrentMessage('');
    
            const messagesForGuestAPI = [...baseMessages, optimisticUserMessage].map(m => ({ sender: m.sender || m.role, content: m.content }));
            console.log("[HandleSendMessage] Guest: Calling streamGuestResponse with messagesForGuestAPI:", messagesForGuestAPI, "streamTargetId:", streamTargetId);
            await streamGuestResponse(messagesForGuestAPI, streamTargetId, currentChatModelId);
            // isLoading and isStreaming will be reset in streamGuestResponse's finally block
            return;
        }
    
        // ---- Logged-in user flow ----
        const fileForMessagePayload = selectedFile; 
        const previewUrlForOptimisticMessage = filePreviewUrl; 
    
        setCurrentMessage(''); 
        handleRemoveFile(); 
    
        const optimisticUserMessage = {
            id: `temp-user-${Date.now()}`,
            role: 'user', 
            sender: 'user', 
            content: messageContentToSend,
            text: messageContentToSend, 
            imageUrl: fileForMessagePayload?.mimeType.startsWith('image/') ? previewUrlForOptimisticMessage : null, 
            fileName: fileForMessagePayload?.name,
            fileType: fileForMessagePayload?.mimeType,
            usedWebSearch: isWebSearchEnabled,
            createdAt: new Date().toISOString(), 
        };
    
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = {
            id: streamTargetId, role: 'ai', sender: 'ai', content: '', text:'', reasoning: '', isStreaming: true, modelId: currentChatModelId, createdAt: new Date().toISOString()
        };
        
        const baseMessagesForNewInteraction = currentActiveChatIdVal ? messages : [];
        setMessages([...baseMessagesForNewInteraction, optimisticUserMessage, placeholderAiMessage]);
        
        const messagesForApi = [...baseMessagesForNewInteraction, { role: 'user', content: messageContentToSend }].map(m => ({ role: m.role || m.sender, content: m.content }));
    
        console.log("[HandleSendMessage] Logged-in: Calling handleStreamingRequest. streamTargetId:", streamTargetId, "optimisticUserMessage.id:", optimisticUserMessage.id, "API chatId:", currentActiveChatIdVal);
        console.log("[HandleSendMessage] maximizeTokens value:", maximizeTokens);
        await handleStreamingRequest(
            '/api/chat/stream',
            {
                messages: messagesForApi, 
                chatId: currentActiveChatIdVal, 
                modelId: currentChatModelId,
                useWebSearch: isWebSearchEnabled,
                userApiKey: userKeys.openrouter,
                userTavilyKey: userKeys.tavily,
                fileData: fileForMessagePayload?.base64,
                fileMimeType: fileForMessagePayload?.mimeType,
                fileName: fileForMessagePayload?.name,
                maximizeTokens: maximizeTokens,
            },
            streamTargetId,
            optimisticUserMessage.id
        );
        // isLoading and isStreaming will be reset in handleStreamingRequest's finally block
    };
    

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const toggleTheme = () => document.documentElement.classList.toggle('dark');

    const handleDeleteMessage = useCallback(async (messageIdToDelete) => {
        console.log("[HandleDeleteMessage] Called for messageId:", messageIdToDelete);
        const currentActiveChatIdVal = activeChatIdRef.current; 
        const confirmed = await getConfirmation({
            title: "Delete Message",
            description: "Are you sure? This will also remove the AI's response and cannot be undone.",
            confirmText: "Delete",
        });

        if (!confirmed) return;

        setMessages(prevMsgs => { // Optimistic UI update
            const msgIndex = prevMsgs.findIndex(m => m.id === messageIdToDelete);
            if (msgIndex === -1) return prevMsgs;
            let idsToDeleteSet = new Set([messageIdToDelete]);
            if (prevMsgs[msgIndex]?.sender === 'user' && prevMsgs[msgIndex + 1]?.sender === 'ai') {
                idsToDeleteSet.add(prevMsgs[msgIndex + 1].id);
            }
            return prevMsgs.filter(m => !idsToDeleteSet.has(m.id));
        });


        if (isGuest) {
            setChats(prevChats => {
                const newChats = prevChats.map(chat => {
                    if (chat.id === currentActiveChatIdVal) {
                        const msgIndex = chat.messages.findIndex(m => m.id === messageIdToDelete);
                        if (msgIndex === -1) return chat;
                        let idsToDeleteSet = new Set([messageIdToDelete]);
                         if (chat.messages[msgIndex]?.sender === 'user' && chat.messages[msgIndex + 1]?.sender === 'ai') {
                            idsToDeleteSet.add(chat.messages[msgIndex + 1].id);
                        }
                        const updatedMessages = chat.messages.filter(m => !idsToDeleteSet.has(m.id));
                        if (updatedMessages.length === 0) return null; // Mark for removal
                        return { ...chat, messages: updatedMessages };
                    }
                    return chat;
                }).filter(Boolean); // Remove nulls (empty chats)

                if (newChats.find(c => c.id === currentActiveChatIdVal) === undefined && currentActiveChatIdVal) {
                     setActiveChatId(null); // If active chat was deleted
                }
                return newChats;
            });
            addNotification('Message deleted.', 'info');
            return;
        }
        
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/messages/${messageIdToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                addNotification(data.error || "Failed to delete message from server.", 'error');
                fetchMessages(currentActiveChatIdVal); // Re-fetch to revert optimistic update
                return;
            }

            addNotification('Message deleted.', 'info');

            if (data.chatDeleted) {
                setChats(prev => prev.filter(c => c.id !== data.deletedChatId));
                if (currentActiveChatIdVal === data.deletedChatId) {
                    setActiveChatId(null);
                }
                addNotification('Chat deleted.', 'info');
            } else if (data.deletedIds && data.deletedIds.length > 0) {
                // If not chatDeleted, but messages were deleted, ensure sidebar chat entry is updated
                // This might involve re-fetching chat list or making sidebar smarter
                // For now, optimistic UI on `messages` state is primary.
                // If chat was not deleted but became empty, server might not send chatDeleted.
                // We might need to check if messages is empty and then remove chat from sidebar.
                const remainingMessages = messages.filter(m => !data.deletedIds.includes(m.id));
                if (remainingMessages.length === 0 && currentActiveChatIdVal) {
                    // This case should ideally be handled by `data.chatDeleted` from server.
                    // If server doesn't report chatDeleted but all messages are gone,
                    // we might need to call the deleteChat endpoint or refresh sidebar.
                    // For now, let's assume server handles chat deletion correctly.
                }
            }
             if (data.promotedChats && data.promotedChats.length > 0) {
                addNotification(`${data.promotedChats.length} branched chat(s) promoted.`, 'info');
                // Potentially re-fetch all chats for sidebar update:
                // const updatedChats = await fetchAllChats(); setChats(updatedChats);
            }


        } catch (error) {
            addNotification(error.message, 'error');
            fetchMessages(currentActiveChatIdVal); // Re-fetch to revert optimistic update
        }
    }, [getConfirmation, isGuest, messages, setChats, setActiveChatId, addNotification, getToken, setMessages, fetchMessages]);

    const handleRegenerate = useCallback(async (aiMessageIdToReplace, newModelId) => {
        console.log("[HandleRegenerate] Called for AI message ID:", aiMessageIdToReplace, "New Model ID:", newModelId);

        const aiMessageIndex = messages.findIndex(m => m.id === aiMessageIdToReplace);
        if (aiMessageIndex < 1) { 
            console.error("[HandleRegenerate] Cannot regenerate: AI message not found or is the first message.");
            return;
        }

        const userPromptMessage = messages[aiMessageIndex - 1];
        if (!['user'].includes(userPromptMessage.sender || userPromptMessage.role) ) {
            console.error("[HandleRegenerate] Cannot regenerate: Preceding message is not a user message.");
            return;
        }

        const history = messages.slice(0, aiMessageIndex - 1);
        const modelToUse = newModelId || currentChatModelId; 
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = {
            id: streamTargetId, sender: 'ai', role: 'ai', content: '', text: '', reasoning: '', isStreaming: true, modelId: modelToUse
        };

        const messagesForDisplay = [...history, userPromptMessage, placeholderAiMessage];

        if (isGuest) {
            if (!checkGuestTrial()) return;
            setMessages(messagesForDisplay);
            const messagesForAIGuest = [...history, userPromptMessage].map(m => ({sender: m.sender || m.role, content: m.content}));
            await streamGuestResponse(messagesForAIGuest, streamTargetId, modelToUse);
            return;
        }
        
        setMessages(messagesForDisplay); 

        const shouldUseWebSearch = userPromptMessage.usedWebSearch || false;
        
        let contentForRegeneration = userPromptMessage.content;
        if (!contentForRegeneration && (userPromptMessage.imageUrl || userPromptMessage.fileName)) { 
            contentForRegeneration = userPromptMessage.imageUrl ? "[Image uploaded]" : `[File: ${userPromptMessage.fileName}]`;
        }


        await handleStreamingRegeneration(
            userPromptMessage.id,       
            contentForRegeneration,     
            streamTargetId,             
            modelToUse,
            shouldUseWebSearch
        );
    }, [messages, isGuest, checkGuestTrial, streamGuestResponse, currentChatModelId, handleStreamingRegeneration, setMessages]);

    const handleBranch = useCallback(async (fromAiMessageId, newBranchModelId) => {
        console.log("[HandleBranch] Called for AI message ID:", fromAiMessageId, "New Model ID:", newBranchModelId);
        const currentActiveChatIdVal = activeChatIdRef.current; 

        if (isGuest) {
            const sourceChat = chats.find(c => c.id === currentActiveChatIdVal);
            if (!sourceChat) return;
            
            const messageIndex = sourceChat.messages.findIndex(m => m.id === fromAiMessageId);
            if (messageIndex === -1) return;

            const messagesToCopy = sourceChat.messages.slice(0, messageIndex + 1);

            const newChatId = `guest-chat-${Date.now()}`;
            const newChat = {
                id: newChatId,
                title: `[Branch] ${sourceChat.title}`.substring(0, 30),
                createdAt: new Date().toISOString(),
                modelId: newBranchModelId, 
                messages: messagesToCopy.map(m => ({...m, text: m.content})), 
                sourceChatId: sourceChat.id,
                branchedFromMessageId: fromAiMessageId,
            };

            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChatId); 

            addNotification(`Branched to a new guest chat.`, "success");
            return;
        }

        try {
            setIsLoading(true); // Indicate branching activity
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/branch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    sourceChatId: currentActiveChatIdVal, 
                    fromAiMessageId, 
                    newModelId: newBranchModelId, 
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed to branch chat.");

            const newChatData = await res.json(); // This is the new chat object from server
            
            // The server now copies messages. We need to add the new chat to `chats`
            // and set it active. `fetchMessages` will then load its messages.
            const sourceChatInfo = chats.find(c => c.id === currentActiveChatIdVal);
            const newChatForClient = {
                ...newChatData, // Contains id, title, modelId, userId, createdAt, sourceChatId, branchedFromMessageId
                sourceChat: sourceChatInfo ? { // Add basic source chat info for UI if available
                    id: sourceChatInfo.id,
                    title: sourceChatInfo.title,
                    modelId: sourceChatInfo.modelId,
                } : null,
                // messages will be loaded by fetchMessages when activeChatId changes
            };

            setChats(prev => [newChatForClient, ...prev]);
            setActiveChatId(newChatData.id); // This will trigger fetchMessages for the new branch

            addNotification(`Branched to new chat with ${allModels.find(m=>m.id===newBranchModelId)?.name || 'new model'}.`, "success");
        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isGuest, chats, setChats, setActiveChatId, addNotification, getToken]); 

    const handleGuestModelSelect = () => {
        if (isGuest) {
            addNotification("Model selection is not available in guest mode. Please sign in to use other models.", "error");
        } else {
            setIsModelSelectorOpen(true);
        }
    };


    return (
        <>
            <ImageViewerModal imageUrl={viewingImageUrl} onClose={() => setViewingImageUrl(null)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <ModelSelectorModal
                isOpen={isModelSelectorOpen}
                onClose={() => setIsModelSelectorOpen(false)}
                selectedModel={currentChatModelId}
                setSelectedModel={(newModelId) => {
                    if (activeChat) { 
                        setChats(prev => prev.map(c => 
                            c.id === activeChatIdRef.current ? {...c, modelId: newModelId} : c 
                        ));
                    } else {
                        setNewChatModelId(newModelId);
                    }
                }}
                openSettings={() => setIsSettingsOpen(true)}
            />
            <div className="flex-1 flex flex-col h-full bg-white/50 dark:bg-black/30 relative">
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
                        {messages.length === 0 && !activeChatIdRef.current && !isLoading && !isSwitching && !isStreaming && ( 
                            <WelcomeScreen onSuggestionClick={handleSuggestionClick} user={user} />
                    )}
                    {messages.map((msg) => {
                        const streamingData = streamingMessageContent[msg.id];
                        const isMessageStreaming = !!streamingData || msg.isStreaming;

                        const displayMessage = {
                            ...msg,
                            text: streamingData?.content !== undefined ? streamingData.content : (msg.text || msg.content), 
                            reasoning: streamingData?.reasoning !== undefined ? streamingData.reasoning : msg.reasoning,
                            isStreaming: isMessageStreaming,
                        };
                        
                        return (
                            <ChatMessage
                                key={msg.id}
                                {...displayMessage}
                                modelId={displayMessage.sender === 'ai' ? (displayMessage.modelId || (activeChat?.modelId)) : null}
                                handleRegenerate={handleRegenerate}
                                handleBranch={handleBranch}
                                handleUpdateMessage={handleEditAndResubmit}
                                handleDeleteMessage={handleDeleteMessage}
                                onImageClick={setViewingImageUrl}
                                handleSearchSuggestionClick={handleSearchSuggestionClick}
                                isGuest={isGuest}
                            />
                        );
                    })}

                        <AnimatePresence>
                            {isSearchingWeb && <SearchingIndicator key="searching" />}
                        </AnimatePresence>
                        <AnimatePresence>
                            {isExtractingPDF && <PDFExtractionIndicator fileName={selectedFile?.name} />}
                        </AnimatePresence>
                        <AnimatePresence>
                            {isProcessingImage && <ImageProcessingIndicator key="image-processing" fileName={selectedFile?.name} />}
                        </AnimatePresence>
                        
                        {isLoading && !isStreaming && messages.length > 0 && !messages.some(m => m.isStreaming) && ( 
                        <div className="flex justify-start">
                                <GlassPanel className="p-3">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </GlassPanel>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative z-10 px-4 pb-4 md:px-6 md:pb-6 pt-4">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-3xl mx-auto">
                        { (filePreviewUrl || (selectedFile && selectedFile.mimeType === 'application/pdf')) && ( 
                            <AttachmentPreview 
                                file={selectedFile}
                                previewUrl={filePreviewUrl} 
                                onRemove={handleRemoveFile}
                                onView={() => filePreviewUrl && setViewingImageUrl(filePreviewUrl)} 
                            />
                        )}
                    <GlassPanel className="flex items-center gap-2 p-1.5">
                        <input
                                type="text"
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            placeholder={isGuest ? `Guest Mode (${GUEST_TRIAL_LIMIT - guestTrials} trials left)` : "Type your message here..."}
                            className="flex-1 bg-transparent px-3 py-2 text-md text-slate-700 placeholder:text-slate-500 dark:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none"
                            disabled={isLoading || isStreaming} 
                        />
                        <div className="flex items-center gap-1">
                            <CustomTooltip 
                                text={isGuest ? "Sign in to access other AI models" : "Select Model"}
                                isGuest={isGuest}
                            >
                                <button
                                    onClick={handleGuestModelSelect}
                                    disabled={isGuest}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-black/5 hover:bg-black/10 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 ring-2 
                                        ${isGuest ? 'cursor-not-allowed opacity-50' : (
                                        needsUserKey && !hasUserKey
                                            ? 'ring-red-500/80'
                                            : (needsUserKey && hasUserKey ? 'ring-blue-500/80' : 'ring-transparent')
                                        )}
                                    `}
                                >
                                    {(allModels.find(m => m.id === currentChatModelId))?.name || 'Select Model'}
                                    <ChevronDown size={14} />
                                </button>
                            </CustomTooltip>

                            <CustomTooltip 
                                text={isGuest ? "Sign in to enable real-time web search" : "Toggle Web Search"}
                                isGuest={isGuest}
                            >
                                <button
                                    onClick={() => !isGuest && setIsWebSearchEnabled(!isWebSearchEnabled)}
                                    disabled={isGuest}
                                    className={`p-2 rounded-lg transition-colors relative ${isGuest ? 'cursor-not-allowed opacity-50' : (isWebSearchEnabled ? 'bg-blue-600/30 text-blue-400' : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10')}`}
                                >
                                    <Globe size={18} className={isWebSearchEnabled ? '' : "text-slate-600 dark:text-gray-400"} />
                                    {!isGuest && isWebSearchEnabled && (
                                        <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-blue-500 text-white rounded-full px-1 py-0 leading-tight">
                                            {userKeys.tavily ? 'P' : 'D'}
                                        </span>
                                    )}
                                </button>
                            </CustomTooltip>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                                    className="hidden"
                                disabled={isGuest}
                                />
                            <CustomTooltip 
                                text={isGuest ? "Sign in to attach files" : "Attach image or PDF"}
                                isGuest={isGuest}
                            >
                                <button
                                    onClick={() => !isGuest && fileInputRef.current?.click()}
                                    disabled={isGuest}
                                    className={`p-2 rounded-lg transition-colors ${isGuest ? 'cursor-not-allowed opacity-50' : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                                >
                                    <Paperclip size={18} className="text-slate-600 dark:text-gray-400" />
                                </button>
                            </CustomTooltip>
                        </div>
                            <button
                                id="send-button"
                                onClick={handleSendMessage}
                                disabled={isLoading || isStreaming || (!currentMessage.trim() && !selectedFile)}
                                className={`p-2 rounded-lg transition-all duration-300 ${(currentMessage.trim() || selectedFile) && !(isLoading || isStreaming) ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 dark:bg-gray-700 cursor-not-allowed'}`}
                            >
                            <ArrowUp size={20} />
                        </button>
                    </GlassPanel>
                </motion.div>
            </div>
        </div>
        <ScrollToBottomButton containerRef={chatContainerRef} activeChatId={activeChatId} />
        </>
    );
};

export default MainContent;