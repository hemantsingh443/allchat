import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import Sidebar, { SidebarToggle } from './components/Sidebar';
import MainContent from './components/MainContent';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from './contexts/NotificationContext';
import MigrationModal from './components/MigrationModal';
import { motion, AnimatePresence } from 'framer-motion';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

// A simple hook to check for a media query
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQueryList = window.matchMedia(query);
        const listener = (event) => setMatches(event.matches);
        
        // Add listener
        mediaQueryList.addEventListener('change', listener);
        
        // Cleanup
        return () => mediaQueryList.removeEventListener('change', listener);
    }, [query]);

    return matches;
};


const T3ChatUI = ({ isGuest, handleSignIn }) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

    const { getToken } = useAuth();
    const memoizedGetToken = useCallback(getToken, [getToken]);
    const { getConfirmation } = useNotification();

    // Set sidebar state based on viewport size
    useEffect(() => {
        setIsSidebarOpen(isDesktop);
    }, [isDesktop]);

    // Mouse position effect for aurora animation
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

    const handleModalConfirmation = (shouldMigrate) => {
        setIsMigrationModalOpen(false);
        handleSignIn(shouldMigrate);
    };

    const contextValue = useMemo(() => ({
        isGuest,
        handleSignIn: triggerSignInFlow,
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        getToken: memoizedGetToken,
        getConfirmation,
    }), [isGuest, triggerSignInFlow, chats, activeChatId, memoizedGetToken, getConfirmation]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <AppContext.Provider value={contextValue}>
            <MigrationModal 
                isOpen={isMigrationModalOpen}
                onConfirm={handleModalConfirmation}
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
                    <AnimatePresence>
                        {!isDesktop && isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={toggleSidebar}
                                className="fixed inset-0 bg-black/40 z-30"
                            />
                        )}
                    </AnimatePresence>
                    <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
                    <MainContent />
                    <SidebarToggle isOpen={isSidebarOpen} toggle={toggleSidebar} />
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default T3ChatUI;