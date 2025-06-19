import React from 'react';
import { Eye, Brain, Code } from 'lucide-react';

// This component can be simple as the tooltips are not a priority right now.
export const CapabilityIcons = ({ capabilities = {}, size = 14 }) => (
    <div className="flex items-center gap-1.5 text-slate-400">
        {capabilities.vision && (
            <Eye size={size} className="text-green-400" />
        )}
        {capabilities.reasoning && (
            <Brain size={size} className="text-purple-400" />
        )}
        {capabilities.code && (
            <Code size={size} className="text-orange-400" />
        )}
    </div>
); 