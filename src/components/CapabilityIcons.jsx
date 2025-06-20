import React from 'react';
import { Eye, Brain, Code } from 'lucide-react';
import ActionTooltip from './ActionTooltip';

// This component can be simple as the tooltips are not a priority right now.
export const CapabilityIcons = ({ capabilities = {}, size = 14 }) => (
    <div className="flex items-center gap-1.5 text-slate-400">
        {capabilities.vision && (
            <ActionTooltip text="Vision">
                <Eye size={size} className="text-green-400" />
            </ActionTooltip>
        )}
        {capabilities.reasoning && (
            <ActionTooltip text="Reasoning">
                <Brain size={size} className="text-purple-400" />
            </ActionTooltip>
        )}
        {capabilities.code && (
            <ActionTooltip text="Code">
                <Code size={size} className="text-orange-400" />
            </ActionTooltip>
        )}
    </div>
); 