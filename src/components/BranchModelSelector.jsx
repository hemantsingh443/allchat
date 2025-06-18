import React, { useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import GlassPanel from './GlassPanel';
import { X, Info, Brain, Eye, Code } from 'lucide-react';
import { allModels, modelCategories } from '../data/models';
import { useApiKeys } from '../contexts/ApiKeyContext';

// Enhanced CapabilityIcons component with efficient tooltips
const CapabilityIcon = ({ icon: Icon, color, tooltip, size = 14 }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    const handleMouseEnter = useCallback(() => {
        setShowTooltip(true);
    }, []);
    
    const handleMouseLeave = useCallback(() => {
        setShowTooltip(false);
    }, []);

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Icon size={size} className={color} />
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                    <GlassPanel className="px-2 py-1 text-xs whitespace-nowrap">
                        <span className="text-slate-600 dark:text-gray-300">{tooltip}</span>
                    </GlassPanel>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white/10 dark:bg-black/10 rotate-45" />
                </div>
            )}
        </div>
    );
};

export const CapabilityIcons = ({ capabilities = {}, size = 14 }) => (
    <div className="flex items-center gap-1 text-slate-400">
        {capabilities.vision && (
            <CapabilityIcon 
                icon={Eye} 
                color="text-green-400" 
                tooltip="Vision" 
                size={size} 
            />
        )}
        {capabilities.reasoning && (
            <CapabilityIcon 
                icon={Brain} 
                color="text-purple-400" 
                tooltip="Reasoning" 
                size={size} 
            />
        )}
        {capabilities.code && (
            <CapabilityIcon 
                icon={Code} 
                color="text-orange-400" 
                tooltip="Code" 
                size={size} 
            />
        )}
    </div>
);

const BranchModelSelector = ({ onSelect, onCancel, title = "Select model", isOpen, currentModelId, isGuest = false }) => {
    const { userKeys } = useApiKeys();
    const currentModel = allModels.find(m => m.id === currentModelId);

    // For guests, only allow Google and Mistral models
    const guestAllowedModels = [
        'google/gemini-1.5-flash-latest',
        'google/gemini-pro-1.5',
        'mistralai/mistral-7b-instruct:free',
        'mistralai/devstral-small:free'
    ];

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onCancel}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-[340px] max-w-sm transform text-left align-middle transition-all">
                                <GlassPanel className="p-2">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-gray-300">
                                                {title}
                                            </p>
                                            <Info size={14} className="text-slate-400" />
                                        </div>
                                        <button 
                                            onClick={onCancel} 
                                            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 transition-colors"
                                        >
                                            <X size={16}/>
                                        </button>
                                    </div>

                                    {isGuest && (
                                        <div className="mb-3 px-2 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Guest users can only regenerate with Google and Mistral models. Sign in to access all models.
                                            </p>
                                        </div>
                                    )}

                                    <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                                        {currentModel && (
                                            <button
                                                onClick={() => onSelect(currentModelId)}
                                                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150
                                                    bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Regenerate with {currentModel.name}</span>
                                                </div>
                                                <CapabilityIcons capabilities={currentModel.capabilities} />
                                            </button>
                                        )}

                                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />

                                        {modelCategories.map((category) => {
                                            // Filter models based on user type
                                            const filteredModels = category.models.filter(model => {
                                                if (isGuest) {
                                                    // For guests, only show Google and Mistral models
                                                    return guestAllowedModels.includes(model.id);
                                                } else {
                                                    // For logged-in users, show models they have access to
                                                    return model.id.startsWith('google/') || userKeys.openrouter || model.isFree;
                                                }
                                            });
                                            
                                            if (filteredModels.length === 0) return null;

                                            return (
                                                <div key={category.name} className="space-y-1">
                                                    <h3 className="px-2 py-1 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase flex items-center gap-2">
                                                        {category.logo} {category.name}
                                                    </h3>
                                                    {filteredModels.map(model => {
                                                        const isDisabled = isGuest ? false : (!model.id.startsWith('google/') && !model.isFree && !userKeys.openrouter);
                                                        return (
                                                            <button
                                                                key={model.id}
                                                                onClick={() => onSelect(model.id)}
                                                                disabled={isDisabled}
                                                                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150
                                                                    text-slate-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 
                                                                    disabled:opacity-40 disabled:cursor-not-allowed
                                                                    ${model.id === currentModelId ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{model.name}</span>
                                                                    {model.isFree && (
                                                                        <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">
                                                                            Free
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <CapabilityIcons capabilities={model.capabilities} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </GlassPanel>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default BranchModelSelector;