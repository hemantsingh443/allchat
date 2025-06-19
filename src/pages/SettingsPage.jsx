import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { User, Key, Settings, LogOut, ArrowLeft, Sun, Moon } from 'lucide-react';

const settingsTabs = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Customization', href: '/settings/customization', icon: Settings },
    { name: 'API Keys', href: '/settings/api-keys', icon: Key },
];

const SettingsSidebar = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const toggleTheme = () => document.documentElement.classList.toggle('dark');

    return (
        <aside className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col p-4 bg-white dark:bg-[#1C1C1F] border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 p-2">
                 <div className="relative">
                     <img src={user?.imageUrl} alt={user?.fullName} className="w-9 h-9 rounded-full" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-transparent rounded-full"></span>
                 </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
            </div>
            <nav className="flex flex-col gap-1 mt-6">
                {settingsTabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={tab.href}
                        end={tab.href === '/settings/profile'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm ${
                                isActive 
                                    ? 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-gray-50'
                                    : 'text-slate-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                            }`
                        }
                    >
                        <tab.icon size={16} />
                        <span>{tab.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-200/10 dark:border-slate-800/20 pt-4 space-y-1">
                <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <span className="dark:hidden"><Sun size={16} /></span>
                    <span className="hidden dark:inline"><Moon size={16} /></span>
                    <span>Toggle Theme</span>
                </button>
                <button onClick={() => signOut(() => navigate('/'))} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

const MobileSettingsNav = () => {
    const location = useLocation();
    // Determine the active tab based on the current URL path
    const getActiveTab = () => {
        if (location.pathname === '/settings/customization') return 'Customization';
        if (location.pathname === '/settings/apikeys') return 'API Keys';
        return 'Profile';
    };

    return (
        <div className="md:hidden w-full mb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-around">
                {settingsTabs.map(tab => (
                    <NavLink
                        key={tab.name}
                        to={tab.href}
                        end={tab.exact}
                        className={`flex-1 text-center py-3 text-sm font-medium transition-colors ${getActiveTab() === tab.name ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 dark:text-gray-400'}`}
                    >
                        {tab.name}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return (
        <div 
            className="h-screen w-screen flex flex-col bg-[#F9F9FB] dark:bg-[#111015] interactive-aurora-bg"
            style={{ '--x': `${mousePos.x}px`, '--y': `${mousePos.y}px` }}
        >
            <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#1C1C1F]/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800/50">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white">
                    <ArrowLeft size={16} />
                    Back to Chat
                </button>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-gray-200 glass-text">Settings</h1>
                <div className="w-28"></div>
            </header>
            <div className="flex flex-1 overflow-y-auto md:overflow-hidden">
                {/* Desktop Sidebar */}
                <SettingsSidebar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
                     <MobileSettingsNav />
                     <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SettingsPage; 