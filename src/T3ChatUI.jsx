
import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import Sidebar, { SidebarToggle } from './components/Sidebar';
import MainContent from './components/MainContent';
import { useAuth } from '@clerk/clerk-react';
import { useNotification } from './contexts/NotificationContext'; 

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const T3ChatUI = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const { getToken } = useAuth();
    const memoizedGetToken = useCallback(getToken, [getToken]);
    const { getConfirmation } = useNotification(); 

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const contextValue = {
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        getToken: memoizedGetToken,
        getConfirmation,
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div 
                className="h-screen w-full font-sans overflow-hidden bg-white dark:bg-[#111015] interactive-aurora-bg"
                style={{ '--x': `${mousePos.x}px`, '--y': `${mousePos.y}px` }}
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