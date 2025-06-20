import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Sun, Moon, Code, Eye, Brain, Filter, X,
    BookOpen, Globe, Paperclip, ArrowUp, ChevronDown, Trash2, Info,
    LoaderCircle, CheckCircle, XCircle, Lightbulb, Maximize2, FileText, Sparkles, Search, Gem,
    FlaskConical, Rocket, BrainCircuit, HelpCircle, ArrowLeft
} from 'lucide-react';
import { useAppContext } from '../App';
import { useAuth } from '@clerk/clerk-react';
import GlassPanel from './GlassPanel';
import ChatMessage from './ChatMessage';
import { Transition, Dialog } from '@headlessui/react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { allModels } from '../data/models';
import { useNotification } from '../contexts/NotificationContext';
import ScrollToBottomButton from './ScrollToBottomButton';
import HierarchicalModelSelector from './HierarchicalModelSelector';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const GUEST_TRIAL_LIMIT = 8;
const GUEST_TRIAL_COUNT_KEY = 'allchat-guest-trials';

// ... (WelcomeScreen, AttachmentPreview, etc. remain unchanged) ...
const WelcomeScreen = ({ onSuggestionClick, user }) => {
    const greeting = user?.firstName ? `How can I help you, ${user.firstName}?` : "How can I help you?";

    const suggestionData = [
        { 
            id: 'create',
            icon: <Sparkles size={16} />, label: "Create", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/50",
            suggestions: [
                { prompt: "Write a short story about a robot learning to paint", icon: <Sparkles size={18} className="text-blue-500" /> },
                { prompt: "Draft a professional email to a potential client", icon: <FileText size={18} className="text-green-500" /> },
                { prompt: "Create a catchy slogan for a new coffee brand", icon: <Lightbulb size={18} className="text-yellow-500" /> },
                { prompt: "Write a python script to organize files by extension", icon: <Code size={18} className="text-red-500" /> },
            ]
        },
        { 
            id: 'explore',
            icon: <Search size={16} />, label: "Explore", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/50",
            suggestions: [
                { prompt: "Are black holes real? And if so, what would happen if I fell into one?", icon: <Rocket size={18} className="text-orange-500" /> },
                { prompt: "What are some recent discoveries in marine biology?", icon: <FlaskConical size={18} className="text-cyan-500" /> },
                { prompt: "Summarize the plot of 'Dune' by Frank Herbert", icon: <BookOpen size={18} className="text-amber-600" /> },
                { prompt: "Explore the history of ancient Rome", icon: <HelpCircle size={18} className="text-indigo-500" /> },
            ]
        },
        { 
            id: 'code',
            icon: <Code size={16} />, label: "Code", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/50",
            suggestions: [
                { prompt: "What are the best practices for learning a new programming language?", icon: <Code size={18} className="text-red-500" /> },
                { prompt: "Explain how to use the 'map' function in JavaScript with an example", icon: <BrainCircuit size={18} className="text-blue-500" /> },
                { prompt: "Write a simple 'Hello, World!' program in Rust", icon: <FileText size={18} className="text-green-500" /> },
                { prompt: "How can I set up a basic Express.js server?", icon: <HelpCircle size={18} className="text-indigo-500" /> },
            ]
        },
        { 
            id: 'learn',
            icon: <BookOpen size={16} />, label: "Learn", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/50",
            suggestions: [
                { prompt: "Explain how AI works as if I were five years old", icon: <BrainCircuit size={18} className="text-purple-500" /> },
                { prompt: "Give me a fun science experiment I can do at home with my kids", icon: <FlaskConical size={18} className="text-green-500" /> },
                { prompt: "How can I improve my productivity and time management?", icon: <Brain size={18} className="text-blue-500" /> },
                { prompt: "What was the significance of the Silk Road?", icon: <HelpCircle size={18} className="text-indigo-500" /> },
            ]
        },
    ];
    
    const [activeCategory, setActiveCategory] = useState(suggestionData[0]);

    return (
        <div className="flex flex-col justify-center items-center h-full text-center py-10 w-full max-w-3xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 glass-text">
                {greeting}
            </h2>

            <div className="flex items-center gap-2 sm:gap-3 mb-10 flex-wrap justify-center">
                {suggestionData.map((category) => (
                    <motion.button 
                        key={category.id}
                        onClick={() => setActiveCategory(category)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg shadow-sm border backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 ${activeCategory.id === category.id ? `${category.color} ${category.bgColor} border-current/30 ring-current/30` : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-gray-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                        whileHover={{ scale: 1.07, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {category.icon}
                        <span className="text-sm font-medium">{category.label}</span>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.05 } }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full text-left space-y-2"
                >
                    {activeCategory.suggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion.prompt)}
                        className="flex items-center gap-4 w-full text-left text-slate-600 dark:text-gray-400 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 5 }}
                    >
                        {suggestion.icon}
                        <span>{suggestion.prompt}</span>
                    </motion.button>
                ))}
                </motion.div>
            </AnimatePresence>
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
    const { 
        chats, setChats, activeChatId, setActiveChatId, getToken, getConfirmation, 
        isGuest, handleSignIn, messages, setMessages, isLoadingMessages 
    } = useAppContext();
    
    const { userKeys, maximizeTokens } = useApiKeys();
    const { addNotification } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentMessage, setCurrentMessage] = useState('');
    const [newChatModelId, setNewChatModelId] = useState('google/gemini-1.5-flash-latest');
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState('');
    const [viewingImageUrl, setViewingImageUrl] = useState(null);
    const [isExtractingPDF, setIsExtractingPDF] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [notifiedChats, setNotifiedChats] = useState(new Set());
    const [streamingMessageContent, setStreamingMessageContent] = useState({});
    
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const isAtBottomRef = useRef(true);

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
        setTimeout(() => document.getElementById('send-button')?.click(), 50);
    };

    const handleSearchSuggestionClick = (suggestion) => {
        if (!isWebSearchEnabled) setIsWebSearchEnabled(true);
        setCurrentMessage(suggestion);
        setTimeout(() => document.getElementById('send-button')?.click(), 50);
    };

    const checkGuestTrial = useCallback(() => {
        if (guestTrials >= GUEST_TRIAL_LIMIT) {
            addNotification('You have reached the guest trial limit. Please sign in to continue.', 'error');
            setTimeout(() => handleSignIn(true), 1500);
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
    
    const currentChatModelId = useMemo(() => activeChat?.modelId || newChatModelId, [activeChat, newChatModelId]);
    
    const currentModelDetails = allModels.find(m => m.id === currentChatModelId);
    const needsUserKey = currentModelDetails && !currentModelDetails.id.startsWith('google/') && !currentModelDetails.isFree;
    const hasUserKey = !!userKeys.openrouter;

    useEffect(() => {
        if (isGuest && currentModelDetails && !currentModelDetails.isFree) {
            const freeModel = allModels.find(m => m.isFree);
            if (freeModel) {
                if (activeChat) setChats(prev => prev.map(c => c.id === activeChatId ? {...c, modelId: freeModel.id} : c));
                else setNewChatModelId(freeModel.id);
                addNotification(`Switched to free model: ${freeModel.name}`, 'info');
            }
        }
    }, [isGuest, currentModelDetails, activeChat, setChats, addNotification, activeChatId]);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;
        const handleScroll = () => { isAtBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 50; };
        container.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container && isAtBottomRef.current) {
            container.scrollTo({ top: container.scrollHeight, behavior: isStreaming ? 'auto' : 'smooth' });
        }
    }, [messages, streamingMessageContent, isStreaming]);
    
    const processStream = useCallback(async (response, streamTargetId, optimisticUserMessageId, onCompleteCallback) => {
        if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({error: 'Streaming request failed'}));
            throw new Error(errorData.error || 'Streaming request failed');
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
                        switch (data.type) {
                            case 'chat_info':
                                if (data.newChat) {
                                    setChats(p => p.find(c => c.id === data.newChat.id) ? p : [data.newChat, ...p]);
                                    setActiveChatId(data.newChat.id); 
                                }
                                if (optimisticUserMessageId && data.userMessage) setMessages(prev => prev.map(msg => msg.id === optimisticUserMessageId ? { ...data.userMessage, text: data.userMessage.content } : msg));
                                break;
                            case 'content_word':
                                currentContentAccumulator.content += data.content;
                                setStreamingMessageContent(prev => ({ ...prev, [streamTargetId]: { ...currentContentAccumulator } }));
                                break;
                            case 'reasoning_word': case 'google_thought_word':
                                currentContentAccumulator.reasoning += data.content;
                                setStreamingMessageContent(prev => ({ ...prev, [streamTargetId]: { ...currentContentAccumulator } }));
                                break;
                            case 'complete':
                                if (data.aiMessage) setMessages(prev => prev.map(msg => msg.id === streamTargetId ? { ...data.aiMessage, text: data.aiMessage.content, isStreaming: false } : msg));
                                if (onCompleteCallback) onCompleteCallback();
                                reader.cancel(); return;
                            case 'key_usage':
                                if (data.source === 'server_default' && activeChatId && !notifiedChats.has(activeChatId)) {
                                    addNotification('Using default key. Add your own in settings.', 'info');
                                    setNotifiedChats(prev => new Set(prev).add(activeChatId));
                                } break;
                            case 'error': throw new Error(data.error);
                        }
                    } catch (e) { console.error('Stream processing error:', e); }
                }
            }
        }
    }, [setChats, setActiveChatId, addNotification, notifiedChats, activeChatId, setMessages]);

    const handleStreamingRequest = useCallback(async (endpoint, body, streamTargetId, optimisticUserMessageId, onCompleteCallback) => {
        if (body.useWebSearch) setIsSearchingWeb(true);
        if (body.fileMimeType?.startsWith('image/')) setIsProcessingImage(true);
        else if (body.fileMimeType) setIsExtractingPDF(true);
        
        setIsStreaming(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            await processStream(response, streamTargetId, optimisticUserMessageId, onCompleteCallback);
        } catch (error) {
            addNotification(error.message || 'An error occurred.', 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId && m.id !== optimisticUserMessageId));
        } finally {
            setIsStreaming(false);
            setIsSearchingWeb(false); setIsExtractingPDF(false); setIsProcessingImage(false);
            setStreamingMessageContent(prev => { const { [streamTargetId]: _, ...rest } = prev; return rest; });
        }
    }, [getToken, addNotification, processStream, setMessages]); 

    const streamGuestResponse = useCallback(async (messagesForAI, streamTargetId, modelIdToUse, currentLocalChatId) => {
        setIsStreaming(true);
        try {
            const response = await fetch(`${API_URL}/api/chat/guest/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messagesForAI, modelId: modelIdToUse }) });
            if (!response.ok || !response.body) throw new Error((await response.json().catch(() => ({}))).error || 'Guest stream request failed');
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
                            if (data.type === 'complete') { reader.cancel(); break; }
                            if (data.type === 'content_word') currentContentAccumulator.content += data.content;
                            if (data.type === 'reasoning_word' || data.type === 'google_thought_word') currentContentAccumulator.reasoning += data.content;
                            setStreamingMessageContent(prev => ({ ...prev, [streamTargetId]: { ...currentContentAccumulator } }));
                            if (data.type === 'error') throw new Error(data.error);
                        } catch (e) { console.error('Guest stream parse error:', e); }
                    }
                }
            }
            const finalAiMessage = { id: streamTargetId, sender: 'ai', role: 'ai', content: currentContentAccumulator.content, text: currentContentAccumulator.content, reasoning: currentContentAccumulator.reasoning, createdAt: new Date().toISOString(), modelId: modelIdToUse, isStreaming: false };
            setMessages(prevLocalMessages => {
                const updatedMessages = prevLocalMessages.map(m => m.id === streamTargetId ? finalAiMessage : m);
                setChats(prevChats => {
                    if (!currentLocalChatId || !prevChats.find(c => c.id === currentLocalChatId)) {
                        const newChatId = `guest-chat-${Date.now()}`;
                        const newChat = { id: newChatId, title: (updatedMessages[0]?.content || "New Chat").substring(0, 30), createdAt: new Date().toISOString(), modelId: modelIdToUse, messages: updatedMessages };
                        setActiveChatId(newChatId);
                        return [newChat, ...prevChats];
                    }
                    return prevChats.map(c => c.id === currentLocalChatId ? { ...c, messages: updatedMessages } : c);
                });
                return updatedMessages; 
            });
        } catch (error) {
            addNotification(error.message, 'error');
            setMessages(prev => prev.filter(m => m.id !== streamTargetId)); 
        } finally {
            setIsStreaming(false);
            setStreamingMessageContent(prev => { const { [streamTargetId]: _, ...rest } = prev; return rest; });
        }
    }, [addNotification, setChats, setActiveChatId, setMessages]);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile({ base64: reader.result.split(',')[1], mimeType: file.type, name: file.name });
                if (file.type.startsWith('image/')) setFilePreviewUrl(URL.createObjectURL(file)); else setFilePreviewUrl(''); 
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addNotification('Unsupported file. Please select an image or PDF.', 'error');
        }
    }, [addNotification]);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null); setFilePreviewUrl('');
        if(fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleSendMessage = useCallback(async () => {
        if ((!currentMessage.trim() && !selectedFile) || isStreaming) return;
    
        const messageContentToSend = currentMessage;
        const chatModelId = activeChat?.modelId || newChatModelId;
        const currentActiveChatId = activeChatId;
    
        if (isGuest) {
            if (selectedFile || isWebSearchEnabled) return addNotification('File attachments and web search are not available in guest mode.', 'error');
            if (!checkGuestTrial()) return;
    
            const optimisticUserMessage = { id: `guest-msg-${Date.now()}`, content: messageContentToSend, text: messageContentToSend, sender: 'user', role: 'user', createdAt: new Date().toISOString() };
            const streamTargetId = `guest-streaming-ai-${Date.now()}`;
            const baseMessages = currentActiveChatId ? messages : [];
            const placeholderAiMessage = { id: streamTargetId, sender: 'ai', role: 'ai', isStreaming: true, modelId: chatModelId, createdAt: new Date().toISOString() };
            setMessages([...baseMessages, optimisticUserMessage, placeholderAiMessage]);
            setCurrentMessage('');
            setStreamingMessageContent({ [streamTargetId]: { content: '', reasoning: '' } });
            const messagesForGuestAPI = [...baseMessages, optimisticUserMessage].map(m => ({ sender: m.sender || m.role, content: m.content }));
            streamGuestResponse(messagesForGuestAPI, streamTargetId, chatModelId, currentActiveChatId);
            return;
        }
    
        const fileForMessagePayload = selectedFile; 
        const previewUrlForOptimisticMessage = filePreviewUrl; 
        setCurrentMessage(''); 
        handleRemoveFile(); 
    
        const optimisticUserMessage = { id: `temp-user-${Date.now()}`, role: 'user', sender: 'user', content: messageContentToSend, text: messageContentToSend, imageUrl: fileForMessagePayload?.mimeType.startsWith('image/') ? previewUrlForOptimisticMessage : null, fileName: fileForMessagePayload?.name, fileType: fileForMessagePayload?.mimeType, usedWebSearch: isWebSearchEnabled, createdAt: new Date().toISOString() };
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const placeholderAiMessage = { id: streamTargetId, sender: 'ai', role: 'ai', isStreaming: true, modelId: chatModelId, createdAt: new Date().toISOString() };
        const baseMessagesForNewInteraction = currentActiveChatId ? messages : [];
        setMessages([...baseMessagesForNewInteraction, optimisticUserMessage, placeholderAiMessage]);
        setStreamingMessageContent({ [streamTargetId]: { content: '', reasoning: '' } });
        const messagesForApi = [...baseMessagesForNewInteraction, { role: 'user', content: messageContentToSend }].map(m => ({ role: m.sender || m.role, content: m.content }));
        const onComplete = currentActiveChatId ? () => {} : undefined;
        handleStreamingRequest('/api/chat/stream', { messages: messagesForApi, chatId: currentActiveChatId, modelId: chatModelId, useWebSearch: isWebSearchEnabled, userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily, fileData: fileForMessagePayload?.base64, fileMimeType: fileForMessagePayload?.mimeType, fileName: fileForMessagePayload?.name, maximizeTokens: maximizeTokens }, streamTargetId, optimisticUserMessage.id, onComplete);
    }, [currentMessage, selectedFile, isStreaming, activeChat, newChatModelId, activeChatId, isGuest, checkGuestTrial, isWebSearchEnabled, messages, handleRemoveFile, userKeys, maximizeTokens, handleStreamingRequest, streamGuestResponse, setMessages, addNotification]);
    
    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const toggleTheme = () => { document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); };

    const handleEditAndResubmit = useCallback((userMessageId, newContent) => {
        const chatModelId = activeChat?.modelId || newChatModelId;
        let originalUserMessage = null;
        const streamTargetId = isGuest ? `guest-streaming-ai-${Date.now()}` : `streaming-ai-${Date.now()}`;
        
        setMessages(prevMessages => {
            const messageIndex = prevMessages.findIndex(m => m.id === userMessageId);
            if (messageIndex === -1) return prevMessages;
            originalUserMessage = prevMessages[messageIndex];
            const history = prevMessages.slice(0, messageIndex);
            const updatedUserMessageForDisplay = { ...originalUserMessage, content: newContent, text: newContent, editCount: (originalUserMessage.editCount || 0) + 1 };
            const placeholderAiMessage = { id: streamTargetId, sender: 'ai', role: 'ai', isStreaming: true, modelId: chatModelId };
            return [...history, updatedUserMessageForDisplay, placeholderAiMessage];
        });
        setStreamingMessageContent({ [streamTargetId]: { content: '', reasoning: '' } });
        if (!originalUserMessage) return;
        if (isGuest) {
            if (!checkGuestTrial()) return;
            const history = messages.slice(0, messages.findIndex(m => m.id === userMessageId));
            const messagesForAIGuest = [...history, { ...originalUserMessage, content: newContent }].map(m => ({sender: m.sender || m.role, content: m.content}));
            streamGuestResponse(messagesForAIGuest, streamTargetId, chatModelId, activeChatId); 
            return;
        }
        handleStreamingRequest('/api/chat/regenerate/stream', { messageId: userMessageId, newContent, chatId: activeChatId, modelId: chatModelId, useWebSearch: originalUserMessage.usedWebSearch || false, userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily, maximizeTokens: maximizeTokens }, streamTargetId, userMessageId, () => {});
    }, [activeChat, newChatModelId, isGuest, checkGuestTrial, userKeys, maximizeTokens, handleStreamingRequest, streamGuestResponse, setMessages, messages, activeChatId]);

    const handleDeleteMessage = useCallback(async (messageIdToDelete) => {
        const confirmed = await getConfirmation({ title: "Delete Message", description: "This action is permanent and will remove the AI's response too.", confirmText: "Delete" });
        if (!confirmed) return;
        const currentLocalChatId = activeChatId;
        if (isGuest) {
            setMessages(prev => prev.filter(m => m.id !== messageIdToDelete && m.id !== prev[prev.findIndex(i => i.id === messageIdToDelete) + 1]?.id));
            setChats(prev => prev.map(c => c.id === currentLocalChatId ? { ...c, messages: c.messages.filter(m => m.id !== messageIdToDelete && m.id !== c.messages[c.messages.findIndex(i => i.id === messageIdToDelete) + 1]?.id) } : c).filter(c => c.messages.length > 0));
            if (chats.find(c => c.id === currentLocalChatId)?.messages.length <= 2) setActiveChatId(null);
            addNotification('Message deleted.', 'info');
            return;
        }
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/messages/${messageIdToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete.");
            setMessages(prev => prev.filter(m => !data.deletedIds.includes(m.id)));
            if (data.chatDeleted) {
                setChats(prev => prev.filter(c => c.id !== data.deletedChatId));
                if (currentLocalChatId === data.deletedChatId) setActiveChatId(null);
            }
        } catch (error) { addNotification(error.message, 'error'); }
    }, [getConfirmation, isGuest, chats, setChats, setActiveChatId, addNotification, getToken, setMessages, activeChatId]);

    const handleRegenerate = useCallback(async (aiMessageIdToReplace, newModelId) => {
        const modelToUse = newModelId || activeChat?.modelId || newChatModelId;
        const streamTargetId = `streaming-ai-${Date.now()}`;
        const currentActiveChatId = activeChatId;
        let userPromptMessage;
        setMessages(prev => {
            const aiMessageIndex = prev.findIndex(m => m.id === aiMessageIdToReplace);
            if (aiMessageIndex < 1 || prev[aiMessageIndex - 1].sender !== 'user') return prev;
            userPromptMessage = prev[aiMessageIndex - 1];
            const history = prev.slice(0, aiMessageIndex - 1);
            const placeholder = { id: streamTargetId, sender: 'ai', role: 'ai', isStreaming: true, modelId: modelToUse };
            return [...history, userPromptMessage, placeholder];
        });
        setStreamingMessageContent({ [streamTargetId]: { content: '', reasoning: '' } });
        setTimeout(async () => {
            if (!userPromptMessage) return;
            if (isGuest) {
                if (!checkGuestTrial()) return;
                const history = messages.slice(0, messages.findIndex(m => m.id === aiMessageIdToReplace) - 1);
                const messagesForAI = [...history, userPromptMessage].map(m => ({ sender: m.sender, content: m.content }));
                streamGuestResponse(messagesForAI, streamTargetId, modelToUse, currentActiveChatId);
                return;
            }
            handleStreamingRequest('/api/chat/regenerate/stream', { messageId: userPromptMessage.id, newContent: userPromptMessage.content, chatId: currentActiveChatId, modelId: modelToUse, useWebSearch: userPromptMessage.usedWebSearch, userApiKey: userKeys.openrouter, userTavilyKey: userKeys.tavily, maximizeTokens }, streamTargetId, userPromptMessage.id, () => {});
        }, 0);
    }, [activeChat, newChatModelId, activeChatId, isGuest, checkGuestTrial, userKeys.openrouter, userKeys.tavily, maximizeTokens, streamGuestResponse, handleStreamingRequest, messages, setMessages]);

    const handleBranch = useCallback(async (fromAiMessageId, newBranchModelId) => {
        const currentActiveChatId = activeChatId; 
        if (isGuest) {
            const sourceChat = chats.find(c => c.id === currentActiveChatId);
            if (!sourceChat) return;
            const messageIndex = sourceChat.messages.findIndex(m => m.id === fromAiMessageId);
            if (messageIndex === -1) return;
            const newChat = { id: `guest-chat-${Date.now()}`, title: `[Branch] ${sourceChat.title.substring(0, 20)}`, createdAt: new Date().toISOString(), modelId: newBranchModelId, messages: sourceChat.messages.slice(0, messageIndex + 1).map(m => ({...m, text: m.content})), sourceChatId: sourceChat.id, branchedFromMessageId: fromAiMessageId };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id); return;
        }
        try {
            setIsStreaming(true);
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/branch`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ sourceChatId: currentActiveChatId, fromAiMessageId, newModelId: newBranchModelId }) });
            if (!res.ok) throw new Error((await res.json()).error || "Failed to branch.");
            const newChatData = await res.json();
            setChats(prev => [newChatData, ...prev]);
            setActiveChatId(newChatData.id);
        } catch (error) { addNotification(error.message, 'error'); } finally { setIsStreaming(false); }
    }, [isGuest, chats, setChats, setActiveChatId, addNotification, getToken, activeChatId]);

    const handleGuestModelSelect = useCallback(() => {
        if (isGuest) addNotification("Sign in to use other models.", "info");
        else setIsModelSelectorOpen(true);
    }, [isGuest, addNotification]);
    
    const handleSetSelectedModel = useCallback(async (newModelId) => {
        if (newModelId === currentChatModelId) return;
        if (activeChat) {
            const originalModelId = activeChat.modelId;
            setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, modelId: newModelId } : c));
            if (!isGuest) {
                try {
                    const token = await getToken();
                    await fetch(`${API_URL}/api/chats/${activeChat.id}/model`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ newModelId }) });
                } catch (error) {
                    addNotification('Could not save model change.', 'error');
                    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, modelId: originalModelId } : c));
                }
            }
        } else setNewChatModelId(newModelId);
    }, [activeChat, activeChatId, currentChatModelId, isGuest, getToken, setChats, addNotification]);

    return (
        <>
            <ImageViewerModal imageUrl={viewingImageUrl} onClose={() => setViewingImageUrl(null)} />
            <HierarchicalModelSelector 
                isOpen={isModelSelectorOpen} 
                onClose={() => setIsModelSelectorOpen(false)} 
                currentModelId={currentChatModelId} 
                onSelectModel={handleSetSelectedModel} 
                isGuest={isGuest} 
            />
            <div className="flex-1 flex flex-col h-full bg-white/50 dark:bg-black/30 relative">
            <header className="flex justify-end items-center p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div onClick={() => !isGuest && navigate('/settings')} className={`transition-transform duration-200 ease-out ${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`} title={isGuest ? 'Sign in to access settings' : ''}>
                        <GlassPanel className="p-2 rounded-full cursor-pointer"><Settings className="text-slate-500 dark:text-gray-400" size={20} /></GlassPanel>
                    </div>
                    <div className="transition-transform duration-200 ease-out hover:scale-110" onClick={toggleTheme}>
                        <GlassPanel className="p-2 rounded-full cursor-pointer">
                            <span className="dark:hidden"><Moon size={20} className="text-slate-500" /></span>
                            <span className="hidden dark:inline"><Sun size={20} className="text-gray-400" /></span>
                        </GlassPanel>
                    </div>
                </div>
            </header>
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-4xl mx-auto px-4 space-y-4 py-4">
                        {messages.length === 0 && !activeChatId && !isLoadingMessages && !isStreaming && <WelcomeScreen onSuggestionClick={handleSuggestionClick} user={user} />}
                        {messages.map((msg) => {
                            const streamingData = streamingMessageContent[msg.id];
                            const isMessageStreaming = !!streamingData || msg.isStreaming;
                            const text = streamingData?.content !== undefined ? streamingData.content : (msg.text || msg.content);
                            const reasoning = streamingData?.reasoning !== undefined ? streamingData.reasoning : msg.reasoning;
                            return <ChatMessage key={msg.id} {...msg} text={text} reasoning={reasoning} isStreaming={isMessageStreaming} handleRegenerate={handleRegenerate} handleBranch={handleBranch} handleUpdateMessage={handleEditAndResubmit} handleDeleteMessage={handleDeleteMessage} onImageClick={setViewingImageUrl} handleSearchSuggestionClick={handleSearchSuggestionClick} isGuest={isGuest} />;
                        })}
                        <AnimatePresence>
                            {isSearchingWeb && <ProcessingIndicator key="searching" icon={<Globe size={16} />} text="Searching the web..." />}
                            {isExtractingPDF && <ProcessingIndicator key="pdf" icon={<FileText size={16} />} text={`Extracting from ${selectedFile?.name}...`} />}
                            {isProcessingImage && <ProcessingIndicator key="image-processing" icon={<Eye size={16} />} text={`Processing ${selectedFile?.name}...`} />}
                        </AnimatePresence>
                        {isLoadingMessages && !isStreaming && <div className="flex justify-center py-4"><LoadingIndicator /></div>}
                    </div>
                </div>
                <div className="relative z-10 px-2 pb-3 md:px-6 md:pb-6 pt-4">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-3xl mx-auto">
                        {(filePreviewUrl || (selectedFile && selectedFile.mimeType === 'application/pdf')) && <AttachmentPreview file={selectedFile} previewUrl={filePreviewUrl} onRemove={handleRemoveFile} onView={() => filePreviewUrl && setViewingImageUrl(filePreviewUrl)} />}
                        <GlassPanel className="flex flex-col sm:flex-row sm:items-center gap-2 p-1.5">
                            <div className="flex items-center gap-2 w-full">
                                <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={isGuest ? `Guest Mode (${GUEST_TRIAL_LIMIT - guestTrials} left)` : "Type your message here..."} className="flex-1 bg-transparent px-3 py-2 text-md text-slate-700 placeholder:text-slate-500 dark:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none" disabled={isStreaming} />
                                <button id="send-button" onClick={handleSendMessage} disabled={isStreaming || (!currentMessage.trim() && !selectedFile)} className={`p-2 rounded-lg transition-all duration-300 ${(currentMessage.trim() || selectedFile) && !isStreaming ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 dark:bg-gray-700 cursor-not-allowed'}`}><ArrowUp size={20} /></button>
                            </div>
                            <div className="flex items-center gap-1 w-full sm:w-auto justify-start sm:justify-end border-t sm:border-t-0 border-black/5 dark:border-white/5 pt-2 sm:pt-0">
                                <CustomTooltip text={isGuest ? "Sign in to access other AI models" : "Select Model"} isGuest={isGuest}>
                                    <button onClick={handleGuestModelSelect} disabled={isGuest} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-black/5 hover:bg-black/10 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 ring-2 ${isGuest ? 'cursor-not-allowed opacity-50' : (needsUserKey && !hasUserKey ? 'ring-red-500/80' : (needsUserKey && hasUserKey ? 'ring-blue-500/80' : 'ring-transparent'))}`}>
                                        <span className="truncate max-w-[100px] sm:max-w-none">{(allModels.find(m => m.id === currentChatModelId))?.name || 'Select Model'}</span>
                                        <ChevronDown size={14} />
                                    </button>
                                </CustomTooltip>
                                <CustomTooltip text={isGuest ? "Sign in to enable web search" : "Toggle Web Search"} isGuest={isGuest}>
                                    <button onClick={() => !isGuest && setIsWebSearchEnabled(!isWebSearchEnabled)} disabled={isGuest} className={`p-2 rounded-lg transition-colors relative ${isGuest ? 'cursor-not-allowed opacity-50' : (isWebSearchEnabled ? 'bg-blue-600/30 text-blue-400' : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10')}`}>
                                        <Globe size={18} className={isWebSearchEnabled ? '' : "text-slate-600 dark:text-gray-400"} />
                                        {!isGuest && isWebSearchEnabled && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-blue-500 text-white rounded-full px-1 py-0 leading-tight">{userKeys.tavily ? 'P' : 'D'}</span>}
                                    </button>
                                </CustomTooltip>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf" className="hidden" disabled={isGuest} />
                                <CustomTooltip text={isGuest ? "Sign in to attach files" : "Attach image or PDF"} isGuest={isGuest}>
                                    <button onClick={() => !isGuest && fileInputRef.current?.click()} disabled={isGuest} className={`p-2 rounded-lg transition-colors ${isGuest ? 'cursor-not-allowed opacity-50' : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'}`}><Paperclip size={18} className="text-slate-600 dark:text-gray-400" /></button>
                                </CustomTooltip>
                            </div>
                        </GlassPanel>
                    </motion.div>
                </div>
            </div>
            <ScrollToBottomButton containerRef={chatContainerRef} activeChatId={activeChatId} />
        </>
    );
};

export default MainContent;