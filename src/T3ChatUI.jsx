import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import Sidebar, { SidebarToggle } from './components/Sidebar';
import MainContent from './components/MainContent';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from './contexts/NotificationContext';
import MigrationModal from './components/MigrationModal';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const T3ChatUI = ({ isGuest, handleSignIn }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

    const { getConfirmation } = useNotification();

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
        getConfirmation,
    }), [isGuest, triggerSignInFlow, chats, activeChatId, getConfirmation]);

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
                    <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
                    <MainContent />
                    <SidebarToggle isOpen={isSidebarOpen} toggle={toggleSidebar} />
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default T3ChatUI;