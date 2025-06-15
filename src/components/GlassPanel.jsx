import React from 'react';

const GlassPanel = ({ children, className = '' }) => {
    return (
        <div className={`
            backdrop-blur-2xl shadow-xl rounded-2xl
            bg-neutral-400/20 border border-neutral-400/30
            dark:bg-black/30 dark:border-white/10
            ${className}
        `}>
            {children}
        </div>
    );
};

export default GlassPanel;