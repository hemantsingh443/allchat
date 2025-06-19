import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import Sidebar, { SidebarToggle } from './components/Sidebar';
import MainContent from './components/MainContent';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from './contexts/NotificationContext';
import { AppContext } from './App'; // Import context from App.js
import MigrationModal from './components/MigrationModal';
import { motion, AnimatePresence } from 'framer-motion';

// A simple hook to check for a media query
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);
    return matches;
};

const T3ChatUI = ({ isGuest, handleSignIn }) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const { isSidebarOpen, setIsSidebarOpen } = useContext(AppContext);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

    // Add chat state
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    // Get getToken and getConfirmation for context
    const { getToken } = useAuth();
    const { getConfirmation } = useNotification();

    // Set sidebar state based on viewport size
    useEffect(() => {
        setIsSidebarOpen(isDesktop);
    }, [isDesktop, setIsSidebarOpen]);

    // Mouse tracking for aurora background
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const triggerSignInFlow = useCallback(() => {
        setIsMigrationModalOpen(true);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const contextValue = useMemo(() => ({
        isGuest,
        handleSignIn: () => setIsMigrationModalOpen(true),
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        isSidebarOpen,
        setIsSidebarOpen,
        getToken,
        getConfirmation
    }), [isGuest, handleSignIn, chats, setChats, activeChatId, setActiveChatId, isSidebarOpen, setIsSidebarOpen, getToken, getConfirmation]);

    return (
        <AppContext.Provider value={contextValue}>
            <MigrationModal 
                isOpen={isMigrationModalOpen}
                onConfirm={(shouldMigrate) => { setIsMigrationModalOpen(false); handleSignIn(shouldMigrate); }}
                onCancel={() => setIsMigrationModalOpen(false)}
            />
            <div 
                className="h-screen w-full font-sans overflow-hidden bg-white dark:bg-[#111015] interactive-aurora-bg"
                style={{ 
                    '--x': `${mousePos.x}px`, 
                    '--y': `${mousePos.y}px` 
                }}
            >
                <main className="relative z-10 flex h-full">
                    <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
                    <MainContent />
                    <SidebarToggle isOpen={isSidebarOpen} toggle={toggleSidebar} isMobile={!isDesktop} />
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default T3ChatUI;

// Export useAppContext from here to be used by other components
export const useAppContext = () => useContext(AppContext);