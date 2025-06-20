import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Mail, User as UserIcon, Calendar, MessageSquare, BrainCircuit, BarChart2, Key, Shield, Info } from 'lucide-react';
import { useApiKeys } from '../../contexts/ApiKeyContext';
import { allModels, modelCategories } from '../../data/models';
import UsageDetailModal from './UsageDetailModal';
import { useAppContext } from '../../App'; // Corrected import path
import StyledPanel from './StyledPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const StatItem = ({ title, value, icon: Icon, color }) => (
    <div className="flex items-center gap-4">
        <div className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full ${color} bg-opacity-20`}>
            <Icon className={`w-4 h-4 ${color.replace('bg-','text-')}`} />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-gray-400" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-gray-100" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{value}</p>
        </div>
    </div>
);

const ProfileTab = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { userKeys } = useApiKeys();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalContent, setModalContent] = useState({ isOpen: false, title: '', chats: [] });
    const navigate = useNavigate();
    const { chats, setActiveChatId } = useAppContext();

    useEffect(() => {
        fetchStats();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/user-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching user stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (chatId) => {
        setActiveChatId(chatId);
        navigate('/');
    }

    return (
        <>
            <UsageDetailModal 
                isOpen={modalContent.isOpen}
                onClose={() => setModalContent({ isOpen: false, title: '', chats: [] })}
                title={modalContent.title}
                chats={modalContent.chats}
                onChatClick={handleChatClick}
            />
            <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto pt-4">
                {/* Left Column */}
                <div className="w-full lg:w-1/2 space-y-8"> 
                    <StyledPanel>
                        <h2 className="flex items-center gap-3 mb-4 text-base font-semibold text-slate-700 dark:text-gray-200"><BarChart2 size={18}/> Usage Dashboard</h2>
                        <div className="space-y-5">
                            <StatItem title="Total Chats" value={stats?.chatCount || 0} icon={MessageSquare} color="bg-blue-500" />
                            <StatItem title="Messages Sent" value={stats?.messageCount || 0} icon={UserIcon} color="bg-green-500" />
                             <div className="pl-4">
                                <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">API Key Status</p>
                                <div className="text-sm space-y-2 text-slate-500 dark:text-gray-400 pl-1">
                                    <p>OpenRouter: <span className={`font-semibold ${!userKeys.openrouter ? 'text-blue-500' : 'text-green-500'}`}>{userKeys.openrouter ? 'User Provided' : 'Default'}</span></p>
                                    <p>Google: <span className={`font-semibold ${!userKeys.google ? 'text-blue-500' : 'text-green-500'}`}>{userKeys.google ? 'User Provided' : 'Default'}</span></p>
                                    <p>Tavily Search: <span className={`font-semibold ${!userKeys.tavily ? 'text-blue-500' : 'text-green-500'}`}>{userKeys.tavily ? 'User Provided' : 'Default'}</span></p>
                                </div>
                            </div>
                        </div>
                    </StyledPanel>
                    <StyledPanel>
                        <h2 className="flex items-center gap-3 mb-4 text-base font-semibold text-slate-700 dark:text-gray-200"><Shield size={18}/> Account Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                             <div>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Authentication</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">Email</p>
                            </div>
                             <div>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Email Status</p>
                                <p className={`text-sm font-semibold ${user?.primaryEmailAddress.verification.status === 'verified' ? 'text-green-500' : 'text-amber-500'}`}>{user?.primaryEmailAddress.verification.status}</p>
                            </div>
                             <div>
                                <p className="text-xs text-slate-500 dark:text-gray-400">User ID</p>
                                <p className="text-xs font-mono text-slate-500 dark:text-gray-500 break-all">{user?.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Joined On</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">{user?.createdAt.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </StyledPanel>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/2">
                    <div className="h-full">
                        <StyledPanel className="h-full flex flex-col">
                            <h2 className="flex items-center gap-3 mb-4 text-base font-semibold text-slate-700 dark:text-gray-200"><BrainCircuit size={18}/> Model Usage</h2>
                            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-3 pr-3">
                                {loading ? <p className="text-center text-slate-500 dark:text-gray-400 py-8">Loading model data...</p> : ( 
                                    <div className="space-y-2">
                                        {stats && stats.modelUsage.length > 0 ? (
                                            stats.modelUsage.map(({ modelId, count }) => { 
                                                const modelInfo = allModels.find(m => m.id === modelId); 
                                                const categoryInfo = modelCategories.find(c => c.name === modelInfo?.provider); 
                                                const modelChats = chats.filter(chat => chat.modelId === modelId);
                                                return (
                                                    <button
                                                        key={modelId} 
                                                        onClick={() => setModalContent({isOpen: true, title: `${modelInfo?.name || modelId} Chats`, chats: modelChats})}
                                                        className="w-full flex items-center justify-between text-sm p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 text-slate-800 dark:text-gray-200">
                                                            <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-slate-800 dark:text-white">
                                                                {categoryInfo?.logo}
                                                            </span>
                                                            <span className="font-medium">{modelInfo?.name || modelId}</span>
                                                        </div>
                                                        <span className="font-medium text-slate-500 dark:text-gray-400">{count} {count === 1 ? 'chat' : 'chats'}</span>
                                                    </button>
                                                );
                                            }) 
                                        ) : (
                                            <p className="text-slate-500 dark:text-gray-400 text-center py-12">No model usage yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </StyledPanel>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileTab;