import React, { useState, useEffect } from 'react';
import T3ChatUI from './T3ChatUI';
import './index.css';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth, useSignIn, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';

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
    const [migrateHistory, setMigrateHistory] = useState(true);
    const { addNotification } = useNotification();

    // Handle migration after successful sign-in
    useEffect(() => {
        const isMigrationPending = localStorage.getItem(MIGRATION_PENDING_KEY) === 'true';

        if (isLoaded && userId && isMigrationPending) {
            const guestChatsRaw = localStorage.getItem(GUEST_STORAGE_KEY);
            if (guestChatsRaw) {
                try {
                    const guestChats = JSON.parse(guestChatsRaw);
                    if (guestChats.length > 0) {
                        migrateGuestData(guestChats);
                    }
                } catch (e) {
                    console.error("Failed to parse guest data for migration.", e);
                    addNotification("Failed to migrate guest history. Please try again.", "error");
                }
            }
            // Clean up after attempting migration
            localStorage.removeItem(MIGRATION_PENDING_KEY);
            localStorage.removeItem(GUEST_STORAGE_KEY);
        }
    }, [isLoaded, userId, addNotification]);

    const migrateGuestData = async (guestChats) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/chats/migrate-guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ guestChats }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || data.details || 'Migration failed on the server.');
            }

            addNotification(`Successfully migrated ${data.migratedCount || guestChats.length} chats!`, "success");
            
            // Reload the page to show the migrated chats
            window.location.reload();
        } catch (error) {
            console.error('Migration API call failed:', error);
            addNotification(error.message || "Failed to migrate guest history. Please try again.", "error");
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
    
    if (!isLoaded) {
        return <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900" />;
    }

    return (
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
            <Route path="*" element={<NavigateToHome />} />
        </Routes>
    );
};

// Main App component that provides the context
function App() {
    return (
        <ApiKeyProvider>
            <NotificationProvider>
                <AppContent />
            </NotificationProvider>
        </ApiKeyProvider>
    );
}

export default App;