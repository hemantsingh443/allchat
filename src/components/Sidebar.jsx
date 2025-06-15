import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, PanelLeftOpen } from 'lucide-react';
import { UserButton } from "@clerk/clerk-react";
import { useAppContext } from '../T3ChatUI';
import { allModels } from '../data/models';
import GlassPanel from './GlassPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Sidebar = ({ isOpen, toggle }) => {
    const { chats, setChats, activeChatId, setActiveChatId, getToken } = useAppContext();
    const [hoveredChatId, setHoveredChatId] = useState(null);

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
            } catch (error) { console.error(error); }
        };
        fetchChats();
    }, [getToken, setChats]);

    const handleNewChat = () => { setActiveChatId(null); };

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this chat?")) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (activeChatId === chatId) setActiveChatId(null);
            }
        } catch (error) { console.error("Failed to delete chat:", error); }
    };

    return (
        <motion.div
            animate={{ width: isOpen ? 260 : 56 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative h-full flex flex-col p-3 backdrop-blur-3xl transition-colors duration-300
                       bg-white/40 border-r border-white/60
                       dark:bg-black/40 dark:border-r dark:border-white/20"
        >
            <button
                onClick={toggle}
                className="absolute top-4 left-3 p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 z-10"
            >
                <PanelLeftOpen size={20} className="text-slate-700 dark:text-gray-300" />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="w-full h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between pl-12 pr-2 mb-4">
                            <h1 className="text-lg font-bold text-slate-700 dark:text-gray-300">AllChat</h1>
                            <UserButton afterSignOutUrl='/' />
                        </div>

                        <div onClick={handleNewChat} className="mb-5 transition-transform duration-200 ease-out hover:scale-[1.03] cursor-pointer">
                            <GlassPanel className="p-2.5 hover:bg-neutral-400/30 dark:hover:bg-black/50 transition-colors">
                                <div className="flex items-center justify-center gap-2 w-full text-sm font-medium text-slate-700 dark:text-gray-300">
                                    <Plus size={16} />
                                    <span>New Chat</span>
                                </div>
                            </GlassPanel>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    onMouseEnter={() => setHoveredChatId(chat.id)}
                                    onMouseLeave={() => setHoveredChatId(null)}
                                    className={`relative flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {(() => {
                                        const model = allModels.find(m => m.id === chat.modelId);
                                        const modelName = model ? model.name : (chat.modelId ? chat.modelId.split('/')[1] || 'Default' : 'Default Model');
                                        return (
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <MessageSquare size={16} className="text-slate-500 dark:text-gray-400 flex-shrink-0" />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-sm font-medium text-slate-700 dark:text-gray-300">{chat.title}</span>
                                                    <span className="truncate text-xs text-slate-500 dark:text-gray-500">{modelName}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
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
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Sidebar;