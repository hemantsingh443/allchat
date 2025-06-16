import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import GlassPanel from './GlassPanel';
import { X, Info, Brain, Eye, Code } from 'lucide-react';
import { allModels, modelCategories } from '../data/models';
import { useApiKeys } from '../contexts/ApiKeyContext';

const CapabilityIcons = ({ capabilities = {} }) => (
    <div className="flex items-center gap-2 text-slate-400">
        {capabilities.vision && <Eye size={14} className="text-green-400" title="Vision Enabled" />}
        {capabilities.reasoning && <Brain size={14} className="text-purple-400" title="Advanced Reasoning" />}
        {capabilities.code && <Code size={14} className="text-orange-400" title="Code Generation" />}
    </div>
);

const BranchModelSelector = ({ onSelect, onCancel, title = "Select model", isOpen, currentModelId }) => {
    const { userKeys } = useApiKeys();
    const currentModel = allModels.find(m => m.id === currentModelId);

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
                                            const filteredModels = category.models.filter(model => 
                                                model.id.startsWith('google/') || userKeys.openrouter || model.isFree
                                            );
                                            
                                            if (filteredModels.length === 0) return null;

                                            return (
                                                <div key={category.name} className="space-y-1">
                                                    <h3 className="px-2 py-1 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase flex items-center gap-2">
                                                        {category.logo} {category.name}
                                                    </h3>
                                                    {filteredModels.map(model => {
                                                        const isDisabled = !model.id.startsWith('google/') && !model.isFree && !userKeys.openrouter;
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