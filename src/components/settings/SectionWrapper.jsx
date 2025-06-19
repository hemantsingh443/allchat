import React from 'react';
import GlassPanel from '../GlassPanel';

const SectionWrapper = ({ children }) => {
    return (
        <GlassPanel className="p-5 bg-transparent dark:bg-transparent">
            {children}
        </GlassPanel>
    );
};

export default SectionWrapper; 