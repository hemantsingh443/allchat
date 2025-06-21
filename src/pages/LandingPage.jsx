import React, { useState, useEffect } from 'react';
import GlassPanel from '../components/GlassPanel';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5 dark:invert" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.334,48,30.651,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
  </svg>
);

const LandingPage = ({ onSignIn, onTryOut }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="w-screen h-screen flex items-center justify-center bg-white dark:bg-[#111015] interactive-aurora-bg"
            style={{ '--x': `${mousePos.x}px`, '--y': `${mousePos.y}px` }}
        >
            <GlassPanel className="p-10 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 via-gray-500 to-pink-300 dark:from-gray-300 dark:via-gray-200 dark:to-pink-200 bg-clip-text text-transparent">
                    Welcome to AllChat
                </h1>
                <p className="mt-4 mb-8 text-lg text-slate-600 dark:text-gray-300">
                    Your intelligent conversation partner.
                </p>
                <div className="space-y-4 max-w-sm mx-auto">
                                        <button 
                        onClick={onSignIn}
                        className="group w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg text-md font-medium text-slate-700/80 dark:text-gray-300/80 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/20 hover:text-slate-800 dark:hover:text-gray-200 hover:border-white/30 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
                                        >
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
                                        </button>
                    
                    <div className="relative pt-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300/50 dark:border-slate-600/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white/0 backdrop-blur-sm text-slate-500 dark:text-gray-400">or</span>
                                    </div>
                                </div>
                                
                                            <button 
                        onClick={onTryOut}
                        className="group relative w-full py-3 px-4 rounded-lg text-md font-medium text-slate-700/80 dark:text-gray-300/80 backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/20 hover:text-slate-800 dark:hover:text-gray-200 hover:border-white/30 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                    >
                        <span className="relative z-10">Try out first</span>
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
                                                            </button>
                </div>
            </GlassPanel>
        </div>
    );
};

export default LandingPage;