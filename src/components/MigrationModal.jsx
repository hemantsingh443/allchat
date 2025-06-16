import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Save, X } from 'lucide-react';
import GlassPanel from './GlassPanel';

// Reuse the GoogleIcon from LandingPage
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.334,48,30.651,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
    </svg>
);

const MigrationModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-md"
                >
                    <GlassPanel className="p-8 space-y-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                            <Save className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Save Your Progress?</h2>
                        <p className="text-md text-slate-700 dark:text-gray-300">
                            Sign in to save your guest chat history to your new account. Your trials will also be reset.
                        </p>
                        
                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={() => onConfirm(true)}
                                className="group w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-md font-medium text-slate-700/80 dark:text-gray-300/80 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/20 hover:text-slate-800 dark:hover:text-gray-200 hover:border-white/30 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <GoogleIcon />
                                <span>Sign in and Save History</span>
                                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
                            </button>
                            <button
                                onClick={() => onConfirm(false)}
                                className="group w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-md font-medium text-slate-700/80 dark:text-gray-300/80 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/20 hover:text-slate-800 dark:hover:text-gray-200 hover:border-white/30 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <LogIn size={18} />
                                <span>Sign in without Saving</span>
                                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
                            </button>
                        </div>

                        <button 
                            onClick={onCancel}
                            className="mt-4 text-sm text-slate-500 dark:text-gray-400 hover:underline"
                        >
                            Cancel
                        </button>
                    </GlassPanel>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MigrationModal; 