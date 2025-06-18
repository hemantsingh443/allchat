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
import { CapabilityIcons } from './BranchModelSelector';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const GUEST_TRIAL_LIMIT = 8;
const GUEST_TRIAL_COUNT_KEY = 'allchat-guest-trials';


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
                                                            <CapabilityIcons capabilities={model.capabilities} size={15} />
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
        { icon: <Sparkles size={16} />, label: "Create", gradient: "from-pink-100 to-pink-200 dark:from-pink-600 dark:to-pink-700" },
        { icon: <Search size={16} />, label: "Explore", gradient: "from-blue-100 to-blue-200 dark:from-blue-600 dark:to-blue-700" },
        { icon: <Code size={16} />, label: "Code", gradient: "from-purple-100 to-purple-200 dark:from-purple-600 dark:to-purple-700" },
        { icon: <BookOpen size={16} />, label: "Learn", gradient: "from-green-100 to-green-200 dark:from-green-600 dark:to-green-700" },
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br ${btn.gradient} shadow-sm border border-white/10 dark:border-white/5 text-slate-700 dark:text-gray-100 backdrop-blur-md transition-colors duration-200 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:focus:ring-pink-800/40`}
                        whileHover={{ scale: 1.07, y: -2 }}
                        whileTap={{ scale: 0.97 }}
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

const ProcessingIndicator = ({ icon, text }) => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            y: [0, -4, 0],
            opacity: 1,
            transition: { delay: i * 0.2, repeat: Infinity, duration: 0.8, ease: "easeInOut" }
        })
    };
    return (
        <motion.div
            className="flex justify-start my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400 text-sm font-medium">
                {icon}
                <span>{text}</span>
                <motion.div className="flex gap-1">
                    {[0, 1, 2].map(i =>
                        <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-1.5 h-1.5 bg-slate-500 dark:bg-gray-400 rounded-full" />
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const LoadingIndicator = () => {
    const dots = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            y: [0, -4, 0],
            opacity: 1,
            transition: { delay: i * 0.2, repeat: Infinity, duration: 0.8, ease: "easeInOut" }
        })
    };
    return (
        <motion.div className="flex gap-1.5 p-3">
            {[0, 1, 2].map(i =>
                <motion.div key={i} custom={i} variants={dots} initial="hidden" animate="visible" className="w-2 h-2 bg-slate-500 dark:bg-gray-400 rounded-full" />
            )}
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
    const [notifiedChats, setNotifiedChats] = useState(new Set());
    
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
        if (activeChatId === null) {
            setNewChatModelId('google/gemini-1.5-flash-latest');
        }
    }, [activeChatId]);

    useEffect(() => {
        if (isGuest) {
            localStorage.setItem(GUEST_TRIAL_COUNT_KEY, guestTrials);
        }
    }, [guestTrials, isGuest]);

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

    const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);
    
    // NEW: Robust logic for determining the current model.
    const currentChatModelId = useMemo(() => {
        if (activeChatId === null) {
            return newChatModelId; // For new chats
        }
        // For existing chats, use its modelId, or a safe default if it's missing.
        return activeChat?.modelId || 'google/gemini-1.5-flash-latest';
    }, [activeChatId, activeChat, newChatModelId]);
    
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
    }, [isGuest, currentModelDetails, activeChat, setChats, addNotification]);

    const fetchMessages = useCallback(async (chatIdToFetch) => {
        if (!chatIdToFetch) {
            setMessages([]);
            return;
        }
    
        if (isGuest) {
            const guestChat = chats.find(c => c.id === chatIdToFetch);
            setMessages(guestChat?.messages || []);
            return;
        }
        
        setIsLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatIdToFetch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Failed to fetch messages. Status: ${res.status}`);
            const data = await res.json();
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
            setIsLoading(false);
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [isGuest, chats, getToken, addNotification]);

    useEffect(() => {
        // Guard fetchMessages to prevent re-fetching during an ongoing operation
        if (!isLoading && !isStreaming) {
            fetchMessages(activeChatId);
        }
    }, [activeChatId, fetchMessages]);


    // This effect manages the isAtBottomRef state based on user scroll activity.
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // We consider the user "at the bottom" if they are within 50px of it.
            // This gives a little leeway.
            isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        
        // Run on mount to set initial state
        handleScroll();

        return () => container.removeEventListener('scroll', handleScroll);
    }, []); // Empty dependency array means this sets up the listener once.

    // This effect handles the actual automatic scrolling.
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        // We only auto-scroll if the user is already at the bottom.
        // This prevents yanking the view away if they've scrolled up to read something.
        if (isAtBottomRef.current) {
            const isReceivingStream = isStreaming && messages[messages.length - 1]?.isStreaming;

            container.scrollTo({
                top: container.scrollHeight,
                // 'auto' is an instant scroll, which feels best for streaming.
                // 'smooth' is for when a new message fully arrives.
                behavior: isReceivingStream ? 'auto' : 'smooth'
            });
        }
    // This effect runs whenever the messages array changes (e.g., new message added)
    // or when the streaming content object changes (e.g., new token/word arrives).
    }, [messages, streamingMessageContent, isStreaming]);
    
    const processStream = useCallback(async (response, streamTargetId, optimisticUserMessageId) => {
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
                        
                        switch (data.type) {
                            case 'chat_info':
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
                                break;
                            case 'reasoning_word':
                                currentContentAccumulator.reasoning += data.content;
                                 setStreamingMessageContent(prev => ({ 
                                     ...prev, 
                                     [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator } 
                                 }));
                                break;
                            case 'complete':
                                if (data.aiMessage) {
                                    const finalAiMsg = { ...data.aiMessage, text: data.aiMessage.content, isStreaming: false };
                                    setMessages(prevMsgs => prevMsgs.map(msg => 
                                        msg.id === streamTargetId 
                                            ? finalAiMsg
                                            : msg
                                    ));
                                    
                                    // This logic is complex and might be simplified, but let's keep it for now
                                    if (receivedNewChatInfo && receivedNewChatInfo.id === data.chatId) {
                                        setChats(prevChats => prevChats.map(chat => {
                                            if (chat.id === receivedNewChatInfo.id) {
                                                const finalMessagesForChat = messages.map(m => m.id === streamTargetId ? finalAiMsg : (m.id === optimisticUserMessageId && data.userMessage ? {...data.userMessage, text: data.userMessage.content} : m));
                                                return { ...chat, messages: finalMessagesForChat.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)) };
                                            }
                                            return chat;
                                        }));
                                    }
                                }
                                reader.cancel();
                                return; 
                            case 'key_usage': {
                                const currentChatId = activeChatIdRef.current;
                                if (data.source === 'server_default' && currentChatId && !notifiedChats.has(currentChatId)) {
                                    addNotification('Using default API key for this request. Add your own in settings for more options.', 'info');
                                    setNotifiedChats(prev => new Set(prev).add(currentChatId));
                                }
                                break;
                            }
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
    }, [setChats, setActiveChatId, addNotification, notifiedChats, messages]);


    const handleStreamingRequest = useCallback(async (endpoint, body, streamTargetId, optimisticUserMessageId) => {
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
            await processStream(response, streamTargetId, optimisticUserMessageId);
        } catch (error) {
            console.error('[HandleStreamingRequest] Streaming error:', error);
            addNotification(error.message || 'An error occurred during streaming.', 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId && (optimisticUserMessageId ? m.id !== optimisticUserMessageId : true) ));
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setIsSearchingWeb(false);
            setIsExtractingPDF(false);
            setIsProcessingImage(false);
            setStreamingMessageContent(prev => {
                const { [streamTargetId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [getToken, addNotification, processStream, setMessages]); 

    const streamGuestResponse = useCallback(async (messagesForAI, streamTargetId, modelIdToUse) => {
        setIsLoading(true);
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
            
            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({error: 'Guest stream request failed'}));
                throw new Error(errorData.error);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentContentAccumulator = { content: '', reasoning: '' };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let boundary;
                while ((boundary = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 1);

                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'complete') {
                                reader.cancel();
                                break; 
                            }
                            if (data.type === 'content_word') {
                                currentContentAccumulator.content += data.content;
                                setStreamingMessageContent(prev => ({ ...prev, [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator } }));
                            }
                            if (data.type === 'reasoning_word') { 
                                currentContentAccumulator.reasoning += data.content;
                                 setStreamingMessageContent(prev => ({ ...prev, [streamTargetId]: { ...prev[streamTargetId], ...currentContentAccumulator } }));
                            }
                            if (data.type === 'error') throw new Error(data.error);
                        } catch (e) { console.error('[StreamGuestResponse] Error parsing streaming data line:', line, e); }
                    }
                }
            }
            
            const finalAiMessage = { 
                id: streamTargetId, sender: 'ai', role: 'ai',
                content: currentContentAccumulator.content, text: currentContentAccumulator.content, 
                reasoning: currentContentAccumulator.reasoning,
                createdAt: new Date().toISOString(), modelId: modelIdToUse, isStreaming: false
            };

            setMessages(prevLocalMessages => {
                const updatedLocalMessages = prevLocalMessages.map(m => m.id === streamTargetId ? finalAiMessage : m);
                
                setChats(prevChats => {
                    const currentActiveChatIdVal = activeChatIdRef.current;
                    if (!currentActiveChatIdVal || !prevChats.find(c => c.id === currentActiveChatIdVal)) {
                        const newChatId = `guest-chat-${Date.now()}`;
                        const newChat = {
                            id: newChatId,
                            title: (updatedLocalMessages[0]?.content || "New Chat").substring(0, 30),
                            createdAt: new Date().toISOString(), modelId: modelIdToUse, messages: updatedLocalMessages, 
                        };
                        setActiveChatId(newChatId); 
                        return [newChat, ...prevChats];
                    } else {
                        return prevChats.map(c => c.id === currentActiveChatIdVal ? { ...c, messages: updatedLocalMessages } : c);
                    }
                });
                return updatedLocalMessages; 
            });

        } catch (error) {
            addNotification(error.message, 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId)); 
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamingMessageContent(prev => {
                const { [streamTargetId]: _, ...rest } = prev;
                return rest;
            });
        }
    }, [addNotification, setChats, setActiveChatId, setMessages]);


    const handleEditAndResubmit = useCallback(async (userMessageId, newContent) => {
        const currentActiveChatIdVal = activeChatIdRef.current;
        const chatModelId = activeChat?.modelId || newChatModelId;
        let originalUserMessage = null;

        const streamTargetId = isGuest ? `guest-streaming-ai-${Date.now()}` : `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = {
            id: streamTargetId, sender: 'ai', role: 'ai', content: '', text:'', reasoning: '', isStreaming: true, modelId: chatModelId
        };
        
        setMessages(prevMessages => {
            const messageIndex = prevMessages.findIndex(m => m.id === userMessageId);
            if (messageIndex === -1) {
                console.error("[HandleEditAndResubmit] Original user message not found.");
                return prevMessages;
            }
            originalUserMessage = prevMessages[messageIndex];
            const updatedUserMessageForDisplay = { ...originalUserMessage, content: newContent, text: newContent, editCount: (originalUserMessage.editCount || 0) + 1 };
            return [...prevMessages.slice(0, messageIndex), updatedUserMessageForDisplay, placeholderAiMessage];
        });

        if (!originalUserMessage) return;

        if (isGuest) {
            if (!checkGuestTrial()) return;
            const history = messages.slice(0, messages.findIndex(m => m.id === userMessageId));
            const messagesForAIGuest = [...history, { ...originalUserMessage, content: newContent }].map(m => ({sender: m.sender || m.role, content: m.content}));
            await streamGuestResponse(messagesForAIGuest, streamTargetId, chatModelId); 
            return;
        }
            
        await handleStreamingRequest(
            '/api/chat/regenerate/stream',
            {
                messageId: userMessageId, newContent, chatId: currentActiveChatIdVal, modelId: chatModelId,
                useWebSearch: originalUserMessage.usedWebSearch || false,
                userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily, maximizeTokens: maximizeTokens,
            },
            streamTargetId, userMessageId 
        );
    }, [activeChat, newChatModelId, isGuest, checkGuestTrial, userKeys, maximizeTokens, handleStreamingRequest, streamGuestResponse, setMessages, messages]);


    const handleFileSelect = useCallback((event) => {
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
    }, [addNotification]);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
        setFilePreviewUrl('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    }, []);
    
    const handleSendMessage = useCallback(async () => {
        if ((!currentMessage.trim() && !selectedFile) || isLoading || isStreaming) return;
    
        setIsLoading(true);
        setIsStreaming(true);

        const messageContentToSend = currentMessage;
        const currentActiveChatIdVal = activeChatIdRef.current; 
        const chatModelId = activeChat?.modelId || newChatModelId;
    
        if (isGuest) {
            if (selectedFile || isWebSearchEnabled) {
                addNotification('File attachments and web search are not available in guest mode.', 'error');
                setIsLoading(false); setIsStreaming(false); return;
            }
            if (!checkGuestTrial()) {
                setIsLoading(false); setIsStreaming(false); return;
            }
    
            const optimisticUserMessage = {
                id: `guest-msg-${Date.now()}`, content: messageContentToSend, text: messageContentToSend, 
                sender: 'user', role: 'user', createdAt: new Date().toISOString()
            };
            const streamTargetId = `guest-streaming-ai-${Date.now()}`;
            const placeholderAiMessage = {
                id: streamTargetId, sender: 'ai', role: 'ai', content: '', text:'', reasoning: '', isStreaming: true, modelId: chatModelId
            };
            
            const baseMessages = currentActiveChatIdVal && chats.find(c=>c.id === currentActiveChatIdVal) ? messages : [];
            setMessages([...baseMessages, optimisticUserMessage, placeholderAiMessage]);
            setCurrentMessage('');
    
            const messagesForGuestAPI = [...baseMessages, optimisticUserMessage].map(m => ({ sender: m.sender || m.role, content: m.content }));
            await streamGuestResponse(messagesForGuestAPI, streamTargetId, chatModelId);
            return;
        }
    
        const fileForMessagePayload = selectedFile; 
        const previewUrlForOptimisticMessage = filePreviewUrl; 
    
        setCurrentMessage(''); 
        handleRemoveFile(); 
    
        const optimisticUserMessage = {
            id: `temp-user-${Date.now()}`, role: 'user', sender: 'user', content: messageContentToSend, text: messageContentToSend, 
            imageUrl: fileForMessagePayload?.mimeType.startsWith('image/') ? previewUrlForOptimisticMessage : null, 
            fileName: fileForMessagePayload?.name, fileType: fileForMessagePayload?.mimeType,
            usedWebSearch: isWebSearchEnabled, createdAt: new Date().toISOString(), 
        };
    
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = {
            id: streamTargetId, role: 'ai', sender: 'ai', content: '', text:'', reasoning: '', isStreaming: true, modelId: chatModelId, createdAt: new Date().toISOString()
        };
        
        const baseMessagesForNewInteraction = currentActiveChatIdVal ? messages : [];
        setMessages([...baseMessagesForNewInteraction, optimisticUserMessage, placeholderAiMessage]);
        
        const messagesForApi = [...baseMessagesForNewInteraction, { role: 'user', content: messageContentToSend }].map(m => ({ role: m.role || m.sender, content: m.content }));
    
        await handleStreamingRequest(
            '/api/chat/stream',
            {
                messages: messagesForApi, chatId: currentActiveChatIdVal, modelId: chatModelId,
                useWebSearch: isWebSearchEnabled, userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily,
                fileData: fileForMessagePayload?.base64, fileMimeType: fileForMessagePayload?.mimeType,
                fileName: fileForMessagePayload?.name, maximizeTokens: maximizeTokens,
            },
            streamTargetId, optimisticUserMessage.id
        );
    }, [currentMessage, selectedFile, isLoading, isStreaming, activeChat, newChatModelId, isGuest, checkGuestTrial, isWebSearchEnabled, chats, messages, handleRemoveFile, userKeys, maximizeTokens, handleStreamingRequest, streamGuestResponse]);
    

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const toggleTheme = () => document.documentElement.classList.toggle('dark');

    const handleDeleteMessage = useCallback(async (messageIdToDelete) => {
        const currentActiveChatIdVal = activeChatIdRef.current; 
        const confirmed = await getConfirmation({
            title: "Delete Message",
            description: "Are you sure? This will also remove the AI's response and cannot be undone.",
            confirmText: "Delete",
        });

        if (!confirmed) return;

        setMessages(prevMsgs => {
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
                        const updatedMessages = chat.messages.filter(m => m.id !== messageIdToDelete && (chat.messages[chat.messages.findIndex(i => i.id === messageIdToDelete)+1]?.id !== m.id));
                        if (updatedMessages.length === 0) return null;
                        return { ...chat, messages: updatedMessages };
                    }
                    return chat;
                }).filter(Boolean);

                if (newChats.find(c => c.id === currentActiveChatIdVal) === undefined && currentActiveChatIdVal) {
                     setActiveChatId(null);
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
                addNotification(data.error || "Failed to delete from server.", 'error');
                fetchMessages(currentActiveChatIdVal);
                return;
            }

            addNotification('Message deleted.', 'info');

            if (data.chatDeleted) {
                setChats(prev => prev.filter(c => c.id !== data.deletedChatId));
                if (currentActiveChatIdVal === data.deletedChatId) setActiveChatId(null);
            }
            if (data.promotedChats && data.promotedChats.length > 0) {
                addNotification(`${data.promotedChats.length} branched chat(s) promoted.`, 'info');
            }
        } catch (error) {
            addNotification(error.message, 'error');
            fetchMessages(currentActiveChatIdVal);
        }
    }, [getConfirmation, isGuest, setChats, setActiveChatId, addNotification, getToken, setMessages, fetchMessages]);

    const handleRegenerate = useCallback(async (aiMessageIdToReplace, newModelId) => {
        let userPromptMessage = null;
        let history = [];
        const modelToUse = newModelId || activeChat?.modelId || newChatModelId;
        const streamTargetId = `streaming-ai-${Date.now()}`;

        setMessages(prevMessages => {
            const aiMessageIndex = prevMessages.findIndex(m => m.id === aiMessageIdToReplace);
            if (aiMessageIndex < 1) {
                console.error("Cannot regenerate: AI message not found or is first.");
                return prevMessages;
            }
            userPromptMessage = prevMessages[aiMessageIndex - 1];
            if (userPromptMessage.sender !== 'user') {
                 console.error("Cannot regenerate: Preceding message is not from user.");
                 return prevMessages;
            }
            history = prevMessages.slice(0, aiMessageIndex - 1);
            const placeholderAiMessage = { id: streamTargetId, sender: 'ai', role: 'ai', content: '', text: '', reasoning: '', isStreaming: true, modelId: modelToUse };
            return [...history, userPromptMessage, placeholderAiMessage];
        });

        // Use a timeout to ensure the state has updated before proceeding
        setTimeout(async () => {
            if (!userPromptMessage) return;

            if (isGuest) {
                if (!checkGuestTrial()) return;
                const messagesForAIGuest = [...history, userPromptMessage].map(m => ({sender: m.sender || m.role, content: m.content}));
                await streamGuestResponse(messagesForAIGuest, streamTargetId, modelToUse);
                return;
            }
            
            await handleStreamingRequest(
                '/api/chat/regenerate/stream',
                {
                    messageId: userPromptMessage.id, newContent: userPromptMessage.content, chatId: activeChatIdRef.current, modelId: modelToUse,
                    useWebSearch: userPromptMessage.usedWebSearch || false,
                    userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily, maximizeTokens: maximizeTokens,
                },
                streamTargetId, userPromptMessage.id
            );
        }, 0);
    }, [activeChat, newChatModelId, isGuest, checkGuestTrial, userKeys, maximizeTokens, streamGuestResponse, handleStreamingRequest, setMessages]);

    const handleBranch = useCallback(async (fromAiMessageId, newBranchModelId) => {
        const currentActiveChatIdVal = activeChatIdRef.current; 

        if (isGuest) {
            const sourceChat = chats.find(c => c.id === currentActiveChatIdVal);
            if (!sourceChat) return;
            
            const messageIndex = sourceChat.messages.findIndex(m => m.id === fromAiMessageId);
            if (messageIndex === -1) return;

            const newChat = {
                id: `guest-chat-${Date.now()}`, title: `[Branch] ${sourceChat.title}`.substring(0, 30),
                createdAt: new Date().toISOString(), modelId: newBranchModelId, 
                messages: sourceChat.messages.slice(0, messageIndex + 1).map(m => ({...m, text: m.content})), 
                sourceChatId: sourceChat.id, branchedFromMessageId: fromAiMessageId,
            };

            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id); 
            return;
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/branch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sourceChatId: currentActiveChatIdVal, fromAiMessageId, newModelId: newBranchModelId }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed to branch chat.");

            const newChatData = await res.json();
            
            setChats(prev => [newChatData, ...prev]);
            setActiveChatId(newChatData.id);

        } catch (error) {
            addNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isGuest, chats, setChats, setActiveChatId, addNotification, getToken]);

    const handleGuestModelSelect = useCallback(() => {
        if (isGuest) {
            addNotification("Sign in to use other models.", "info");
        } else {
            setIsModelSelectorOpen(true);
        }
    }, [isGuest, addNotification]);
    
    // NEW: Stable function to handle model changes, including backend persistence.
    const handleSetSelectedModel = useCallback(async (newModelId) => {
        if (newModelId === currentChatModelId) return;

        if (activeChat) {
            const originalModelId = activeChat.modelId;
            setChats(prev => prev.map(c =>
                c.id === activeChatId ? { ...c, modelId: newModelId } : c
            ));

            if (!isGuest) {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API_URL}/api/chats/${activeChat.id}/model`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ newModelId })
                    });
                    if (!res.ok) throw new Error('Failed to save model change.');

                    // Success - no need to rollback
                    const updatedChat = await res.json();
                    console.log('Model updated successfully:', updatedChat);
                    
                } catch (error) {
                    console.error("Failed to persist model change:", error);
                    addNotification('Could not save model change.', 'error');
                    setChats(prev => prev.map(c =>
                        c.id === activeChatId ? { ...c, modelId: originalModelId } : c
                    ));
                }
            }
        } else {
            setNewChatModelId(newModelId);
        }
    }, [activeChat, activeChatId, currentChatModelId, isGuest, getToken, setChats, setNewChatModelId, addNotification]);


    useEffect(() => {
        if (activeChatId === null) {
            setNewChatModelId('google/gemini-1.5-flash-latest');
        }
    }, [activeChatId]);

    return (
        <>
            <ImageViewerModal imageUrl={viewingImageUrl} onClose={() => setViewingImageUrl(null)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <ModelSelectorModal
                isOpen={isModelSelectorOpen}
                onClose={() => setIsModelSelectorOpen(false)}
                selectedModel={currentChatModelId}
                setSelectedModel={handleSetSelectedModel}
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
                    className="flex-1 overflow-y-auto w-full"
                >
                <div className="max-w-4xl mx-auto px-4 space-y-4 py-4">
                        {messages.length === 0 && !activeChatId && !isLoading && !isStreaming && ( 
                            <WelcomeScreen onSuggestionClick={handleSuggestionClick} user={user} />
                    )}
                    {messages.map((msg) => {
                         const streamingData = streamingMessageContent[msg.id];
                         const isMessageStreaming = !!streamingData || msg.isStreaming;

                         const text = streamingData?.content !== undefined ? streamingData.content : (msg.text || msg.content);
                         const reasoning = streamingData?.reasoning !== undefined ? streamingData.reasoning : msg.reasoning;
                        
                        return (
                            <ChatMessage
                                key={msg.id}
                                id={msg.id}
                                sender={msg.sender}
                                editCount={msg.editCount}
                                imageUrl={msg.imageUrl}
                                usedWebSearch={msg.usedWebSearch}
                                fileName={msg.fileName}
                                fileType={msg.fileType}
                                searchResults={msg.searchResults}
                                text={text}
                                reasoning={reasoning}
                                isStreaming={isMessageStreaming}
                                modelId={msg.sender === 'ai' ? (msg.modelId || (activeChat?.modelId)) : null}
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
                            {isSearchingWeb && <ProcessingIndicator key="searching" icon={<Globe size={16} />} text="Searching the web..." />}
                            {isExtractingPDF && <ProcessingIndicator key="pdf" icon={<FileText size={16} />} text={`Extracting from ${selectedFile?.name}...`} />}
                            {isProcessingImage && <ProcessingIndicator key="image-processing" icon={<Eye size={16} />} text={`Processing ${selectedFile?.name}...`} />}
                        </AnimatePresence>
                        
                        {isLoading && !isStreaming && ( 
                            <div className="flex justify-center py-4">
                                <LoadingIndicator />
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