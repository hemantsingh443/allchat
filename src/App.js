import React, { useState, useEffect, useContext, createContext, useMemo, useCallback } from 'react';
import T3ChatUI, { useAppContext } from './T3ChatUI';
import './index.css';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth, useSignIn, AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import ProfileTab from './components/settings/ProfileTab';
import CustomizationTab from './components/settings/CustomizationTab';
import ApiKeysTab from './components/settings/ApiKeysTab';
import { FontProvider, useFont } from './contexts/FontContext';

export const AppContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const GUEST_STORAGE_KEY = 'allchat-guest-history';
const MIGRATION_PENDING_KEY = 'allchat-migration-pending';

// Helper component to navigate home if a user lands on a non-existent page
const NavigateToHome = () => {
    const navigate = useNavigate();
    React.useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null;
}

// Wrapped component that has access to notifications
const AppContent = () => {
    const { userId, isLoaded, getToken } = useAuth();
    const { signIn, isLoaded: isSignInLoaded } = useSignIn();
    const [isGuestMode, setIsGuestMode] = useState(false);
    const { addNotification } = useNotification();
    const memoizedGetToken = useCallback(getToken, [getToken]);
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const { font } = useFont();
    const { getConfirmation } = useNotification();
    const contextValue = useMemo(() => ({
        isGuest: !userId,
        handleSignIn: () => handleSignIn(true), // Simplified sign-in trigger
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        getToken: memoizedGetToken,
        getConfirmation,
        isSidebarOpen,
        setIsSidebarOpen,
        font
    }), [
        userId, chats, activeChatId, memoizedGetToken, 
        getConfirmation, isSidebarOpen, font
    ]);

    // Handle migration after successful sign-in
    useEffect(() => {
        if (isLoaded && userId && localStorage.getItem(MIGRATION_PENDING_KEY)) {
            const guestChatsRaw = localStorage.getItem(GUEST_STORAGE_KEY);
            if (guestChatsRaw) {
                try {
                    let guestChats = JSON.parse(guestChatsRaw); 

                    // --- ROBUST VALIDATION ---
                    // 1. Ensure it's an array.
                    // 2. Filter out any null, undefined, or malformed chat objects.
                    if (Array.isArray(guestChats)) {
                        guestChats = guestChats.filter(chat => chat && chat.id && chat.title && chat.modelId && chat.createdAt);
                    }

                    if (Array.isArray(guestChats) && guestChats.length > 0) { 
                        migrateGuestData(guestChats);
                    } else {
                        // If there's nothing to migrate, just clear the keys and let the user proceed.
                        localStorage.removeItem(GUEST_STORAGE_KEY);
                    }
                } catch (e) {
                    console.error("Failed to parse guest data for migration.", e);
                    localStorage.removeItem(GUEST_STORAGE_KEY);
                }
            }
            localStorage.removeItem(MIGRATION_PENDING_KEY);
        }
    }, [isLoaded, userId, addNotification, getToken]);

    const migrateGuestData = async (guestChats) => {
        try {
            // This log will show you exactly what is being sent to the backend.
            console.log("Attempting to migrate valid guest chats:", guestChats);

            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/migrate-guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ guestChats: guestChats }), // Send the validated and filtered data
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || data.details || 'Migration failed on the server.');
            }
        } catch (err) {
            addNotification('Failed to migrate guest chats.', 'error');
        }
    };

    const handleSignIn = async (shouldMigrate) => {
        if (!isSignInLoaded) return;
        
        if (shouldMigrate) {
            localStorage.setItem(MIGRATION_PENDING_KEY, 'true');
        } else {
            localStorage.removeItem(MIGRATION_PENDING_KEY);
        }

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

    const handleTryOut = () => {
        setIsGuestMode(true);
    };
  
    // --- THEME PERSISTENCE LOGIC ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);
    // --- END THEME PERSISTENCE ---

    if (!isLoaded) {
        return <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900" />;
    }

    return (
        <AppContext.Provider value={contextValue}>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        userId ? (
                            <T3ChatUI isGuest={false} />
                        ) : isGuestMode ? (
                            <T3ChatUI isGuest={true} handleSignIn={handleSignIn} />
                        ) : (
                            <LandingPage 
                                onSignIn={() => handleSignIn(true)} 
                                onTryOut={handleTryOut}
                            />
                        )
                    }
                />
                <Route
                    path="/sso-callback"
                    element={<AuthenticateWithRedirectCallback />}
                />
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

// Main App component that provides the context
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