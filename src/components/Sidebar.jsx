import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, PanelLeftOpen, GitBranch, Search, LogIn, ArrowRight, Pencil } from 'lucide-react';
import { UserButton } from "@clerk/clerk-react";
import { useAppContext } from '../T3ChatUI';
import { allModels } from '../data/models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const GUEST_STORAGE_KEY = 'allchat-guest-history';

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

const Sidebar = ({ isOpen, toggle }) => {
    const { chats, setChats, activeChatId, setActiveChatId, getToken, getConfirmation, isGuest, handleSignIn } = useAppContext();
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Memoize the chat map for efficient lookups
    const chatMap = useMemo(() => 
        new Map(chats.map(chat => [chat.id, chat])),
        [chats]
    );

    // Helper function to get chat depth (how many times it's been branched)
    const getChatDepth = useCallback((chat) => {
        let depth = 0;
        let currentChat = chat;
        while (currentChat.sourceChatId) {
            depth++;
            currentChat = chatMap.get(currentChat.sourceChatId);
            if (!currentChat) break;
        }
        return depth;
    }, [chatMap]);

    // Helper function to get all ancestor chat IDs
    const getAncestorChatIds = useCallback((chat) => {
        const ancestors = new Set();
        let currentChat = chat;
        while (currentChat.sourceChatId) {
            ancestors.add(currentChat.sourceChatId);
            currentChat = chatMap.get(currentChat.sourceChatId);
            if (!currentChat) break;
        }
        return ancestors;
    }, [chatMap]);

    // Helper function to get all descendant chat IDs
    const getDescendantChatIds = useCallback((chatId) => {
        const descendants = new Set();
        const findDescendants = (parentId) => {
            chats.forEach(chat => {
                if (chat.sourceChatId === parentId) {
                    descendants.add(chat.id);
                    findDescendants(chat.id);
                }
            });
        };
        findDescendants(chatId);
        return descendants;
    }, [chats]);

    // Helper function to check if a chat is a root chat
    const isRootChat = useCallback((chat) => !chat.sourceChatId, []);

    // Helper function to get the root chat of a branch
    const getRootChat = useCallback((chat) => {
        let currentChat = chat;
        while (currentChat.sourceChatId) {
            const parentChat = chatMap.get(currentChat.sourceChatId);
            if (!parentChat) break;
            currentChat = parentChat;
        }
        return currentChat;
    }, [chatMap]);

    // Add filtered chats memo
    const filteredChats = useMemo(() => {
        if (!chats) return [];
        if (!searchTerm.trim()) return chats;

        const lowercasedTerm = searchTerm.toLowerCase();
        return chats.filter(chat => 
            chat.title.toLowerCase().includes(lowercasedTerm)
        );
    }, [chats, searchTerm]);

    let lastCategory = null;

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/chats`, { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                if (!res.ok) throw new Error("Failed to fetch chats");
                const data = await res.json();
                setChats(data);
            } catch (error) { 
                console.error("Failed to fetch chats:", error);
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

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();

        const confirmed = await getConfirmation({
            title: "Delete Chat",
            description: "Are you sure you want to permanently delete this chat history?",
            confirmText: "Delete Chat"
        });
        if (!confirmed) return;

        if (isGuest) {
            const newChats = chats.filter(c => c.id !== chatId);
            setChats(newChats);
            if (activeChatId === chatId) {
                setActiveChatId(null);
            }
            return;
        }

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setChats(prev => {
                    const updatedChats = prev.map(chat => {
                        if (data.promotedChats?.includes(chat.id)) {
                            return {
                                ...chat,
                                sourceChatId: null,
                                branchedFromMessageId: null,
                                title: chat.title.startsWith('[Branch]') 
                                    ? chat.title.substring(10) 
                                    : chat.title
                            };
                        }
                        return chat;
                    });
                    return updatedChats.filter(c => c.id !== data.deletedChatId);
                });

                if (activeChatId === data.deletedChatId) {
                    setActiveChatId(null);
                }
            } else {
                const errorData = await res.json();
                console.error("Failed to delete chat:", errorData.error);
            }
        } catch (error) { 
            console.error("Failed to delete chat:", error);
        }
    };

    const handleEditClick = (e, chat) => {
        e.stopPropagation(); // Prevent the chat from being selected
        setEditingChatId(chat.id);
        setEditingTitle(chat.title);
    };

    const handleTitleChange = (e) => {
        setEditingTitle(e.target.value);
    };

    const handleSaveTitle = async (e, chatId) => {
        e.stopPropagation();
        if (!editingTitle.trim()) {
            // If title is empty, cancel edit
            setEditingChatId(null);
            return;
        }

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatId}/title`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newTitle: editingTitle })
            });

            if (res.ok) {
                const updatedChat = await res.json();
                setChats(prevChats =>
                    prevChats.map(c => (c.id === updatedChat.id ? { ...c, title: updatedChat.title } : c))
                );
            } else {
                console.error("Failed to update title");
            }
        } catch (error) {
            console.error("Error updating title:", error);
        } finally {
            setEditingChatId(null);
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isOpen ? 280 : 0 }}
            className="relative h-full overflow-hidden border-r border-black/10 dark:border-white/10"
        >
            <div className="absolute inset-y-0 left-0 w-[280px] flex flex-col">
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

                {/* Add search bar */}
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
                        {filteredChats.map(chat => {
                            // Add category logic
                            const currentCategory = getChatTimeCategory(new Date(chat.createdAt));
                            let categoryHeader = null;

                            if (currentCategory !== lastCategory) {
                                categoryHeader = <CategoryHeader title={currentCategory} />;
                                lastCategory = currentCategory;
                            }

                            const depth = getChatDepth(chat);
                            const ancestors = getAncestorChatIds(chat);
                            const isAncestorActive = ancestors.has(activeChatId);
                            const descendants = getDescendantChatIds(chat.id);
                            const hasBranches = descendants.size > 0;
                            const isRoot = isRootChat(chat);
                            const rootChat = isRoot ? chat : getRootChat(chat);
                            
                            return (
                                <React.Fragment key={chat.id}>
                                    {categoryHeader}
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                    >
                                        <div
                                            onClick={() => setActiveChatId(chat.id)}
                                            onMouseEnter={() => setHoveredChatId(chat.id)}
                                            onMouseLeave={() => setHoveredChatId(null)}
                                            className={`relative flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors 
                                                ${activeChatId === chat.id ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                                                ${isAncestorActive ? 'border-l-2 border-blue-500/50' : ''}
                                                ${hasBranches ? 'border-r-2 border-blue-500/30' : ''}`}
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

                                                {editingChatId === chat.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={handleTitleChange}
                                                        onBlur={(e) => handleSaveTitle(e, chat.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveTitle(e, chat.id);
                                                            if (e.key === 'Escape') setEditingChatId(null);
                                                        }}
                                                        className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm text-sm font-medium p-1.5 rounded-md outline-none border border-white/30 dark:border-white/10 text-slate-700 dark:text-gray-300 placeholder:text-slate-500 dark:placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="truncate text-sm font-medium text-slate-700 dark:text-gray-300">
                                                            {chat.title}
                                                        </span>
                                                        <span className="truncate text-xs text-slate-500 dark:text-gray-500">
                                                            {allModels.find(m => m.id === chat.modelId)?.name || 'Default Model'}
                                                        </span>
                                                    </div>
                                                )}

                                            </div>
                                            {hoveredChatId === chat.id && editingChatId !== chat.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center"
                                                >
                                                    <button
                                                        onClick={(e) => handleEditClick(e, chat)}
                                                        className="p-1 rounded hover:bg-blue-500/20 text-blue-500"
                                                        title="Edit title"
                                                    >
                                                        <Pencil size={14} /> 
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                                        className="p-1 rounded hover:bg-red-500/20 text-red-500"
                                                        title="Delete chat"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Glass Sign in button at bottom */}
                {isGuest && (
                    <div className="p-4 border-t border-black/10 dark:border-white/10">
                        {/* Sign in prompt text */}
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
                                    {/* Shine effect */}
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