import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, PanelLeftOpen, GitBranch } from 'lucide-react';
import { UserButton } from "@clerk/clerk-react";
import { useAppContext } from '../T3ChatUI';
import { allModels } from '../data/models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Sidebar = ({ isOpen, toggle }) => {
    const { chats, setChats, activeChatId, setActiveChatId, getToken, getConfirmation } = useAppContext();
    const [hoveredChatId, setHoveredChatId] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error("Failed to fetch chats");
                const data = await res.json();
                // Sort chats to ensure parent chats appear before their branches
                const sortedChats = [...data].sort((a, b) => {
                    // First sort by creation date
                    const dateCompare = new Date(b.createdAt) - new Date(a.createdAt);
                    if (dateCompare !== 0) return dateCompare;

                    // If dates are equal, ensure parent chats come before their branches
                    if (a.sourceChatId === b.id) return 1;  // b is parent of a
                    if (b.sourceChatId === a.id) return -1; // a is parent of b
                    return 0;
                });
                setChats(sortedChats);
            } catch (error) { console.error(error); }
        };
        if (getToken) fetchChats();
    }, [getToken, setChats]);

    const handleNewChat = () => { setActiveChatId(null); };

    // Create a memoized Map for efficient chat lookups
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

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();

        const descendants = getDescendantChatIds(chatId);
        const hasBranches = descendants.size > 0;

        const confirmed = await getConfirmation({
            title: "Delete Chat",
            description: hasBranches 
                ? "This chat has branches. Deleting it will also delete all its branches. Are you sure?"
                : "Are you sure you want to permanently delete this chat history?",
            confirmText: "Delete Chat"
        });

        if (!confirmed) return;

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Remove the deleted chat and all its branches
                setChats(prev => prev.filter(c => c.id !== data.deletedChatId && !descendants.has(c.id)));
                if (activeChatId === data.deletedChatId || descendants.has(activeChatId)) {
                    setActiveChatId(null);
                }
            } else {
                console.error("Failed to delete chat");
            }
        } catch (error) { 
            console.error("Failed to delete chat:", error);
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
                    </div>
                    <div className="flex items-center gap-2">
                        <UserButton afterSignOutUrl='/' />
                        <button
                            onClick={toggle}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <PanelLeftOpen size={18} className="text-slate-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 px-4 pb-4 custom-scrollbar">
                    <AnimatePresence>
                        {chats.map(chat => {
                            const depth = getChatDepth(chat);
                            const ancestors = getAncestorChatIds(chat);
                            const isAncestorActive = ancestors.has(activeChatId);
                            const descendants = getDescendantChatIds(chat.id);
                            const hasBranches = descendants.size > 0;
                            
                            return (
                                <motion.div
                                    key={chat.id}
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
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate text-sm font-medium text-slate-700 dark:text-gray-300">
                                                    {chat.title}
                                                </span>
                                                <span className="truncate text-xs text-slate-500 dark:text-gray-500">
                                                    {allModels.find(m => m.id === chat.modelId)?.name || 'Default Model'}
                                                </span>
                                            </div>
                                        </div>
                                        {hoveredChatId === chat.id && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                                className="p-1 rounded hover:bg-red-500/20 text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
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
