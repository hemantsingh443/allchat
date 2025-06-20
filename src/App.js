import React, { useState, useEffect, useContext, createContext, useMemo, useCallback } from 'react';
import T3ChatUI from './T3ChatUI';
import './index.css';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth, useSignIn, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import ProfileTab from './components/settings/ProfileTab';
import CustomizationTab from './components/settings/CustomizationTab';
import ApiKeysTab from './components/settings/ApiKeysTab';
import { FontProvider, useFont } from './contexts/FontContext';

export const AppContext = createContext(null);
export const useAppContext = () => useContext(AppContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const GUEST_STORAGE_KEY = 'allchat-guest-history';
const MIGRATION_PENDING_KEY = 'allchat-migration-pending';

const NavigateToHome = () => {
    const navigate = useNavigate();
    useEffect(() => { navigate('/'); }, [navigate]);
    return null;
}

const AppContent = () => {
    const { userId, isLoaded, getToken } = useAuth();
    const { signIn, isLoaded: isSignInLoaded } = useSignIn();
    const [isGuestMode, setIsGuestMode] = useState(false);
    const { addNotification, getConfirmation } = useNotification();
    const memoizedGetToken = useCallback(getToken, [getToken]);
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
    const [chats, setChats] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);
    const { font } = useFont();

    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessageContent, setStreamingMessageContent] = useState({});

    const isGuest = !userId;

    const handleSignIn = async (shouldMigrate) => {
        if (!isSignInLoaded) return;
        localStorage.setItem(MIGRATION_PENDING_KEY, shouldMigrate ? 'true' : 'false');
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/',
            });
        } catch (err) {
            console.error("Google Sign-In failed", err);
            localStorage.removeItem(MIGRATION_PENDING_KEY);
            addNotification("Sign-in failed. Please try again.", "error");
        }
    };

    const contextValue = useMemo(() => ({
        isGuest, handleSignIn,
        chats, setChats,
        stats,
        activeChatId, setActiveChatId,
        getToken: memoizedGetToken,
        getConfirmation,
        isSidebarOpen, setIsSidebarOpen,
        font,
        messages, setMessages,
        isLoadingMessages,
        isStreaming, setIsStreaming,
        streamingMessageContent, setStreamingMessageContent
    }), [
        isGuest, chats, stats, activeChatId, memoizedGetToken, 
        getConfirmation, isSidebarOpen, font, messages, isLoadingMessages, isStreaming, streamingMessageContent, handleSignIn
    ]);
    
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
        setIsLoadingMessages(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/${chatIdToFetch}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error(`Failed to fetch messages. Status: ${res.status}`);
            const data = await res.json();
            // FIX: Removed the redundant JSON.parse. The server now sends the already-parsed object.
            setMessages(data.map(msg => ({ ...msg, text: msg.content })));
        } catch (error) {
            console.error("[FetchMessages] Error for", chatIdToFetch, ":", error);
            addNotification("Could not load messages for this chat.", 'error');
            setMessages([{ id: 'error-' + chatIdToFetch, text: 'Could not load this chat.', sender: 'ai', content: 'Could not load this chat.' }]);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [isGuest, chats, getToken, addNotification]);

    useEffect(() => {
        if (!isStreaming) {
            fetchMessages(activeChatId);
        }
    }, [activeChatId, fetchMessages, isStreaming]);

    const migrateGuestData = useCallback(async (guestChats) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/migrate-guest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ guestChats }) });
            if (!res.ok) throw new Error((await res.json()).error || 'Migration failed.');
        } catch (err) {
            addNotification('Failed to migrate guest chats.', 'error');
        }
    }, [getToken, addNotification]);

    useEffect(() => {
        if (isLoaded && userId && localStorage.getItem(MIGRATION_PENDING_KEY) === 'true') {
            const guestChatsRaw = localStorage.getItem(GUEST_STORAGE_KEY);
            if (guestChatsRaw) {
                try {
                    let guestChats = JSON.parse(guestChatsRaw); 
                    if (Array.isArray(guestChats)) {
                        guestChats = guestChats.filter(chat => chat && chat.id && chat.title && chat.modelId && chat.createdAt);
                        if (guestChats.length > 0) migrateGuestData(guestChats);
                        else localStorage.removeItem(GUEST_STORAGE_KEY);
                    }
                } catch (e) {
                    console.error("Failed to parse guest data for migration.", e);
                    localStorage.removeItem(GUEST_STORAGE_KEY);
                }
            }
            localStorage.removeItem(MIGRATION_PENDING_KEY);
        }
    }, [isLoaded, userId, migrateGuestData]);

    const handleTryOut = () => { setIsGuestMode(true); };
  
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                try {
                    const token = await getToken();
                    const [chatsRes, statsRes] = await Promise.all([
                        fetch(`${API_URL}/api/chats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(`${API_URL}/api/user-stats`, { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);
                    const chatsData = await chatsRes.json();
                    const statsData = await statsRes.json();
                    setChats(Array.isArray(chatsData) ? chatsData : []);
                    setStats(statsData.stats);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    addNotification("Could not load your data.", "error");
                }
            }
        };
        fetchData();
    }, [userId, getToken, addNotification]);

    if (!isLoaded) return <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900" />;

    return (
        <AppContext.Provider value={contextValue}>
            <Routes>
                <Route path="/" element={ userId ? <T3ChatUI isGuest={false} /> : isGuestMode ? <T3ChatUI isGuest={true} handleSignIn={handleSignIn} /> : <LandingPage onSignIn={() => handleSignIn(true)} onTryOut={handleTryOut} /> } />
                <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
                <Route path="/settings" element={userId ? <SettingsPage /> : <NavigateToHome />}>
                    <Route index element={<ProfileTab />} />
                    <Route path="profile" element={<ProfileTab />} />
                    <Route path="customization" element={<CustomizationTab />} />
                    <Route path="api-keys" element={<ApiKeysTab />} />
                </Route>
                <Route path="*" element={<NavigateToHome />} />
            </Routes>
        </AppContext.Provider>
    );
};

function App() {
    return (
        <NotificationProvider>
            <FontProvider>
                <ApiKeyProvider>
                    <AppContent />
                </ApiKeyProvider>
            </FontProvider>
        </NotificationProvider>
    );
}

export default App;