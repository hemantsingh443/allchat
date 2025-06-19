import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';

const SettingsCard = ({ children, title, icon: Icon, className = '', titleClassName = '' }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }} 
            className={className}
        >
            <GlassPanel className="p-5">
                {title && (
                    <div className={`flex items-center gap-3 mb-4 ${titleClassName}`}>
                        {Icon && <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                        <h2 className="text-base font-semibold text-slate-700 dark:text-gray-200">{title}</h2>
                    </div>
                )}
                {children}
            </GlassPanel>
        </motion.div>
    );
};

export default SettingsCard;