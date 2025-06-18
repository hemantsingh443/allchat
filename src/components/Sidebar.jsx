import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, PanelLeftOpen, GitBranch, Search, LogIn, ArrowRight, Pencil, Check, X, GripVertical } from 'lucide-react';
import { UserButton } from "@clerk/clerk-react";
import { useAppContext } from '../T3ChatUI';
import { useNotification } from '../contexts/NotificationContext';
import { allModels } from '../data/models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const GUEST_STORAGE_KEY = 'allchat-guest-history';

// Helper function to validate authentication
const validateAuthentication = async (getToken) => {
    if (!getToken) {
        throw new Error('Authentication not available');
    }

    const token = await getToken();
    
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid authentication token');
    }

    return token;
};

// Add helper function for chat time categorization
const getChatTimeCategory = (chatDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    if (chatDate >= today) return "Today";
    if (chatDate >= yesterday) return "Yesterday";
    if (chatDate >= lastWeek) return "Previous 7 Days";
    if (chatDate >= lastMonth) return "Previous 30 Days";
    
    return chatDate.toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Add category header component
const CategoryHeader = ({ title }) => (
    <div className="px-2 pt-4 pb-1 text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
        {title}
    </div>
);

const ChatItem = React.memo(({ 
    chat,
    depth,
    isActive, 
    onSelect, 
    onDelete, 
    onEdit, 
    isEditing, 
    editingTitle, 
    onTitleChange, 
    onSaveTitle, 
    onCancelEdit 
}) => {
    const [hoveredChatId, setHoveredChatId] = useState(null);
    
    // Safety check for invalid chat object
    if (!chat || !chat.id) {
        return null;
    }
    
    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
        >
            <div
                onClick={() => onSelect(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                className={`relative flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors 
                    ${isActive ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`
                }
                style={{ 
                    marginLeft: `${depth * 12}px`,
                    borderLeft: chat.sourceChatId ? '2px solid rgba(59, 130, 246, 0.2)' : 'none'
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {chat.sourceChatId ? (
                        <GitBranch size={16} className="text-blue-500/70 dark:text-blue-400/70 flex-shrink-0" />
                    ) : (
                        <MessageSquare size={16} className="text-slate-500 dark:text-gray-400 flex-shrink-0" />
                    )}

                    {isEditing ? (
                        <div className="flex items-center gap-1 w-full flex-nowrap overflow-visible">
                            <input
                                type="text"
                                value={editingTitle}
                                onChange={onTitleChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSaveTitle(e, chat.id);
                                    if (e.key === 'Escape') onCancelEdit();
                                }}
                                className="flex-1 min-w-0 max-w-[161px] bg-white/20 dark:bg-black/20 backdrop-blur-sm text-sm font-medium p-1.5 rounded-md outline-none border border-white/30 dark:border-white/10 text-slate-700 dark:text-gray-300 placeholder:text-slate-500 dark:placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSaveTitle(e, chat.id);
                                    }}
                                    className="p-1 rounded hover:bg-blue-500/20 text-blue-500 transition-colors"
                                    title="Save changes"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCancelEdit();
                                    }}
                                    className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                    title="Cancel"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium text-slate-700 dark:text-gray-300">
                                {chat.title || 'Untitled Chat'}
                            </span>
                            <span className="truncate text-xs text-slate-500 dark:text-gray-500">
                                {allModels.find(m => m.id === chat.modelId)?.name || 'Default Model'}
                            </span>
                        </div>
                    )}
                </div>

                {hoveredChatId === chat.id && !isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center"
                    >
                        <button
                            onClick={(e) => onEdit(e, chat)}
                            className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
                            title="Edit title"
                        >
                            <Pencil size={14} /> 
                        </button>
                        <button
                            onClick={(e) => onDelete(chat.id, e)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500"
                            title="Delete chat"
                        >
                            <Trash2 size={14} />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
});

const Sidebar = ({ isOpen, toggle }) => {
    const { chats, setChats, activeChatId, setActiveChatId, getToken, getConfirmation, isGuest, handleSignIn } = useAppContext();
    const { addNotification } = useNotification();
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);
    
    // Load saved sidebar width from localStorage
    useEffect(() => {
        const savedWidth = localStorage.getItem('allchat-sidebar-width');
        if (savedWidth) {
            setSidebarWidth(parseInt(savedWidth, 10));
        }
    }, []);

    // Save sidebar width to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('allchat-sidebar-width', sidebarWidth.toString());
    }, [sidebarWidth]);

    // Handle resize functionality
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing) return;
        
        const newWidth = e.clientX;
        const minWidth = 200;
        const maxWidth = 500;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = await validateAuthentication(getToken);

                const res = await fetch(`${API_URL}/api/chats`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                
                if (!res.ok) {
                    if (res.status === 401) {
                        console.error("Authentication failed when fetching chats");
                        // Don't throw here, just log the error
                        return;
                    } else {
                        throw new Error(`Failed to fetch chats: ${res.status}`);
                    }
                }
                
                const data = await res.json();
                setChats(data);
            } catch (error) { 
                console.error("Failed to fetch chats:", error);
                // Don't show user-facing error for chat fetching as it might be a temporary issue
            }
        };
        
        const loadGuestChats = () => {
            try {
                const storedChats = localStorage.getItem(GUEST_STORAGE_KEY);
                if (storedChats) {
                    setChats(JSON.parse(storedChats));
                }
            } catch (e) {
                console.error("Failed to load guest chats from localStorage", e);
            }
        };

        if (isGuest) {
            loadGuestChats();
        } else {
            if (getToken) fetchChats();
        }
    }, [isGuest, getToken, setChats]);

    useEffect(() => {
        if (isGuest) {
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(chats));
        }
    }, [chats, isGuest]);

    const handleNewChat = () => { setActiveChatId(null); };

    const handleDeleteChat = useCallback(async (chatId, e) => {
        e.stopPropagation();

        const confirmed = await getConfirmation({
            title: "Delete Chat",
            description: "Are you sure you want to permanently delete this chat history?",
            confirmText: "Delete Chat"
        });
        if (!confirmed) return;

        const chatToDelete = chats.find(c => c && c.id === chatId);
        if (!chatToDelete) return;
        
        const childrenToPromote = chats.filter(c => c && c.sourceChatId === chatId);

        // --- OPTIMISTIC UI UPDATE ---
        const previousChats = chats; // Save for potential rollback
        if (activeChatId === chatId) setActiveChatId(null);

        setChats(prev => prev
            .filter(c => c && c.id !== chatId)
            .map(c => childrenToPromote.some(child => child && child.id === c.id) 
                ? { ...c, sourceChatId: null, branchedFromMessageId: null } 
                : c
            )
        );

        if (isGuest) {
            return;
        }

        try {
            const token = await validateAuthentication(getToken);

            const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Failed to delete chat' }));
                
                // Handle specific authentication errors
                if (res.status === 401) {
                    throw new Error('Authentication failed. Please sign in again.');
                } else if (res.status === 403) {
                    throw new Error('You don\'t have permission to delete this chat.');
                } else if (res.status === 404) {
                    throw new Error('Chat not found.');
                } else {
                    throw new Error(errorData.error || `Failed to delete chat (${res.status})`);
                }
            }

            // Success - no action is needed as the UI is already updated
            console.log('Chat deleted successfully');
            
        } catch (error) {
            // Rollback on failure
            setChats(previousChats);
            if (activeChatId === null) setActiveChatId(chatId);
            
            console.error("Failed to delete chat:", error);
            
            // Show user-friendly error message
            if (error.message.includes('Authentication failed')) {
                // Trigger sign-in flow for authentication issues
                addNotification('Authentication failed. Please sign in again.', 'error');
                handleSignIn();
            } else {
                // Show notification for other errors
                addNotification(error.message, 'error');
            }
        }
    }, [chats, getConfirmation, isGuest, getToken, setChats, activeChatId, setActiveChatId, handleSignIn, addNotification]);

    const handleEditClick = useCallback((e, chat) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditingTitle(chat.title);
    }, []);

    const handleTitleChange = useCallback((e) => {
        setEditingTitle(e.target.value);
    }, []);
    
    const handleCancelEdit = useCallback(() => {
        setEditingChatId(null);
        setEditingTitle('');
    }, []);

    const handleSaveTitle = useCallback(async (e, chatId) => {
        e.stopPropagation();
        if (!editingTitle.trim()) {
            handleCancelEdit();
            return;
        }

        const originalTitle = chats.find(c => c.id === chatId)?.title;
        if (editingTitle.trim() === originalTitle) {
            handleCancelEdit();
            return;
        }

        // Optimistic update
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: editingTitle.trim() } : c));
        setEditingChatId(null);

        if(isGuest) return;

        try {
            const token = await validateAuthentication(getToken);

            const res = await fetch(`${API_URL}/api/chats/${chatId}/title`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newTitle: editingTitle })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Failed to update title' }));
                
                // Handle specific authentication errors
                if (res.status === 401) {
                    throw new Error('Authentication failed. Please sign in again.');
                } else if (res.status === 403) {
                    throw new Error('You don\'t have permission to edit this chat.');
                } else if (res.status === 404) {
                    throw new Error('Chat not found.');
                } else {
                    throw new Error(errorData.error || `Failed to update title (${res.status})`);
                }
            }

            // Success - no need to rollback since the update was successful
            const updatedChat = await res.json();
            console.log('Title updated successfully:', updatedChat);
            
        } catch (error) {
            // Rollback on failure
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: originalTitle } : c));
            
            console.error("Error updating title:", error);
            
            // Show user-friendly error message
            if (error.message.includes('Authentication failed')) {
                // Trigger sign-in flow for authentication issues
                addNotification('Authentication failed. Please sign in again.', 'error');
                handleSignIn();
            } else {
                // Show notification for other errors
                addNotification(error.message, 'error');
            }
        } finally {
            handleCancelEdit();
        }
    }, [editingTitle, chats, isGuest, getToken, setChats, handleCancelEdit, handleSignIn, addNotification]);

    // Pre-process chats for efficient rendering
    const processedChats = useMemo(() => {
        try {
            if (!chats || !Array.isArray(chats) || chats.length === 0) {
                return [];
            }

            const validChats = chats.filter(chat => chat && typeof chat === 'object' && chat.id);
            
            if (validChats.length === 0) return [];

            const chatMap = new Map();
            validChats.forEach(chat => chatMap.set(chat.id, { ...chat, children: [] }));

            const roots = [];
            
            for (const [chatId, chat] of chatMap) {
                if (chat.sourceChatId && chatMap.has(chat.sourceChatId)) {
                    const parent = chatMap.get(chat.sourceChatId);
                    if (parent && parent.children) {
                        parent.children.push(chat);
                    }
                } else {
                    roots.push(chat);
                }
            }

            const flatList = [];
            const traverse = (chat, depth) => {
                if (!chat || !chat.id) return;
                flatList.push({ ...chat, depth });
                if (chat.children && Array.isArray(chat.children)) {
                    chat.children
                        .sort((a, b) => (a.branchedFromMessageId || 0) - (b.branchedFromMessageId || 0))
                        .forEach(child => traverse(child, depth + 1));
                }
            };

            roots
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .forEach(root => traverse(root, 0));

            return flatList;
        } catch (error) {
            console.error('Error processing chats:', error);
            return (chats || []).filter(chat => chat && chat.id).map(chat => ({ ...chat, depth: 0 }));
        }
    }, [chats]);

    // Filter the pre-processed chats
    const filteredChats = useMemo(() => {
        if (!searchTerm.trim()) {
            return processedChats.filter(chat => chat && chat.id);
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return processedChats.filter(chat => 
            chat && chat.id && chat.title && chat.title.toLowerCase().includes(lowercasedTerm)
        );
    }, [processedChats, searchTerm]);

    return (
        <motion.div
            ref={sidebarRef}
            initial={false}
            animate={{ width: isOpen ? sidebarWidth : 0 }}
            className="relative h-full overflow-hidden border-r border-black/10 dark:border-white/10"
            style={{ cursor: isResizing ? 'col-resize' : 'default' }}
        >
            <div className="absolute inset-y-0 left-0 flex flex-col" style={{ width: sidebarWidth }}>
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-colors"
                        >
                            <Plus size={16} />
                            New Chat
                        </button>
                        {isGuest && (
                            <div className="flex items-center justify-center w-12 h-6 bg-gradient-to-r from-pink-300 to-blue-300 dark:from-pink-400 dark:to-blue-400 rounded-full">
                                <span className="text-xs font-medium text-white">Guest</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isGuest && <UserButton afterSignOutUrl='/' />}
                        <button
                            onClick={toggle}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <PanelLeftOpen size={18} className="text-slate-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="px-4 pb-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-black/5 dark:bg-white/5 border border-transparent focus:border-blue-500/50 focus:ring-0 outline-none text-slate-700 dark:text-gray-300 placeholder:text-slate-500 dark:placeholder:text-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-slate-500 dark:text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 px-4 pb-4 custom-scrollbar">
                    <AnimatePresence>
                        {(() => {
                            let lastCategory = null;
                            return filteredChats.map(chat => {
                                let categorizationDate = new Date(chat.createdAt);
                                if (chat.sourceChatId) {
                                    const parentChat = chats.find(c => c && c.id === chat.sourceChatId);
                                    if (parentChat) {
                                        categorizationDate = new Date(parentChat.createdAt);
                                    }
                                }
                                
                                const currentCategory = getChatTimeCategory(categorizationDate);
                                let categoryHeader = null;

                                if (currentCategory !== lastCategory) {
                                    categoryHeader = <CategoryHeader title={currentCategory} />;
                                    lastCategory = currentCategory;
                                }

                                return (
                                    <React.Fragment key={chat.id}>
                                        {categoryHeader}
                                        <ChatItem
                                            chat={chat}
                                            depth={chat.depth}
                                            isActive={activeChatId === chat.id}
                                            onSelect={setActiveChatId}
                                            onDelete={handleDeleteChat}
                                            onEdit={handleEditClick}
                                            isEditing={editingChatId === chat.id}
                                            editingTitle={editingTitle}
                                            onTitleChange={handleTitleChange}
                                            onSaveTitle={handleSaveTitle}
                                            onCancelEdit={handleCancelEdit}
                                        />
                                    </React.Fragment>
                                );
                            });
                        })()}
                    </AnimatePresence>
                </div>

                {isGuest && (
                    <div className="p-4 border-t border-black/10 dark:border-white/10">
                        <div className="text-center mb-3">
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                                <span className="text-red-400">*</span> Sign in to save your chats
                            </span>
                        </div>
                        
                        <div className="relative group cursor-pointer" onClick={handleSignIn}>
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <span className="text-sm font-medium text-slate-600/80 dark:text-gray-300/80 backdrop-blur-sm bg-white/20 dark:bg-black/20 px-3 py-1 rounded-full border border-white/30 dark:border-white/10 transition-all duration-300 group-hover:text-slate-700 dark:group-hover:text-gray-200 group-hover:bg-white/30 dark:group-hover:bg-black/30">
                                        Sign in
                                    </span>
                                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent animate-pulse" />
                                </div>
                                <div className="mt-1 flex justify-center">
                                    <ArrowRight size={12} className="text-slate-500/70 dark:text-gray-400/70 transition-all duration-300 group-hover:text-slate-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Resize handle */}
            {isOpen && (
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-10"
                    onMouseDown={handleMouseDown}
                >
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-8 flex items-center justify-center">
                        <GripVertical size={12} className="text-slate-400 dark:text-gray-500" />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const SidebarToggle = ({ isOpen, toggle }) => {
    if (isOpen) return null;
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="absolute top-4 left-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 z-10
                       bg-white/40 dark:bg-black/40 backdrop-blur-sm
                       border border-white/60 dark:border-white/20"
        >
            <PanelLeftOpen size={20} className="text-slate-700 dark:text-gray-300" />
        </motion.button>
    )
}

export default Sidebar;
export { SidebarToggle };