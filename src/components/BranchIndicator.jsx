import React from 'react';
import GlassPanel from './GlassPanel';
import { CornerLeftUp } from 'lucide-react';

const BranchIndicator = ({ parentChat, onNavigate }) => {
    if (!parentChat) return null;

    return (
        <div className="absolute bottom-full left-0 mb-2 z-20">
            <GlassPanel>
                <button
                    onClick={onNavigate}
                    className="group flex items-center gap-1.5 text-left text-slate-500 dark:text-gray-400 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <CornerLeftUp size={13} className="text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-300 group-hover:underline truncate max-w-[120px]">
                        Branch to parent chat
                    </span>
                </button>
            </GlassPanel>
        </div>
    );
};

export default BranchIndicator; 