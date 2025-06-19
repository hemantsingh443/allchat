import React from 'react';

const StyledPanel = ({ children, className = '' }) => {
    return (
        <div className={`
            bg-gradient-to-br from-white to-slate-50
            dark:from-slate-800/80 dark:to-slate-900/80
            p-6 rounded-2xl shadow-lg 
            border border-slate-200/50 dark:border-slate-700/50
            ${className}
        `}>
            {children}
        </div>
    );
};

export default StyledPanel; 