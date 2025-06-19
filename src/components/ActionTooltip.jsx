import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GlassPanel from './GlassPanel';

const ActionTooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div 
            className="relative" 
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                     <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                    >
                        <GlassPanel className="px-2 py-1 text-xs whitespace-nowrap">
                            <span className="text-slate-600 dark:text-gray-300">{text}</span>
                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActionTooltip; 