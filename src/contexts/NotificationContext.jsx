import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import GlassPanel from '../components/GlassPanel';

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);


const Notification = ({ message, type, onDismiss }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-500/80 border-red-400' : 'bg-green-500/80 border-green-400';
    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`relative w-full max-w-sm rounded-lg shadow-2xl p-4 text-white backdrop-blur-md border ${bgColor}`}
        >
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5" />
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button onClick={onDismiss} className="p-1 -m-1 rounded-full hover:bg-white/20 transition-colors">
                    <X size={18} />
                </button>
            </div>
        </motion.div>
    );
};

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, options }) => {
    if (!isOpen) return null;

    const {
        title = "Are you sure?",
        description = "This action cannot be undone.",
        confirmText = "Confirm",
        cancelText = "Cancel"
    } = options;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm"
            >
                <GlassPanel className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100">{title}</h2>
                    <p className="text-sm text-slate-700 dark:text-gray-300">{description}</p>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-black/20 dark:hover:bg-white/20"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                            {confirmText}
                        </button>
                    </div>
                </GlassPanel>
            </motion.div>
        </div>
    );
};


export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmationState, setConfirmationState] = useState({ isOpen: false });

    const addNotification = useCallback((message, type = 'error') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

    
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 2000);
    }, []);
    
    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getConfirmation = useCallback((options = {}) => {
        return new Promise((resolve) => {
            setConfirmationState({
                isOpen: true,
                options,
                onConfirm: () => {
                    setConfirmationState({ isOpen: false });
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmationState({ isOpen: false });
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification, getConfirmation }}>
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
                <AnimatePresence>
                    {notifications.map(n => (
                        <Notification 
                            key={n.id} 
                            message={n.message} 
                            type={n.type}
                            onDismiss={() => dismissNotification(n.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {confirmationState.isOpen && <ConfirmationModal {...confirmationState} />}
            </AnimatePresence>
            {children}
        </NotificationContext.Provider>
    );
};