import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle, Lock, Eye, Brain, Code } from 'lucide-react';
import { modelCategories } from '../data/models';
import { useApiKeys } from '../contexts/ApiKeyContext';
import GlassPanel from './GlassPanel';
import { useNotification } from '../contexts/NotificationContext';
import { CapabilityIcons } from './CapabilityIcons';

const ModelCard = ({ model, isSelected, onSelect, isLocked, onLockClick }) => {
    // List of providers whose logos are black and need to be inverted for dark mode
    const providersToInvert = ['OpenAI', 'xAI', 'Qwen', 'Kimi', 'Ollama', 'Community'];
    return (
        <button 
            onClick={() => isLocked ? onLockClick() : onSelect()} 
            className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200 h-full flex flex-col justify-between ${isSelected ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/10' : 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'} ${isLocked ? 'opacity-60 hover:opacity-100' : ''}`}
        >
            <div>
                {isSelected && <CheckCircle size={20} className="absolute top-2.5 right-2.5 text-red-500" />}
                {isLocked && <Lock size={12} className="absolute top-3 right-3 text-amber-400" />}
                <div className="flex items-center gap-2.5 mb-1"> 
                    <span className={`w-5 h-5 flex items-center justify-center text-slate-800 dark:text-white ${providersToInvert.includes(model.provider) ? 'dark:invert' : ''}`}>
                        {model.providerLogo}
                    </span> 
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-gray-200">{model.name}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{model.provider}</p>
                <CapabilityIcons capabilities={model.capabilities} />
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-3 line-clamp-2">{model.description}</p>
            </div>
            {model.isFree && <div className="text-xs font-bold text-green-600 dark:text-green-400 mt-2">Free Tier</div>}
        </button>
    );
};

const HierarchicalModelSelector = ({ isOpen, onClose, onSelectModel, currentModelId, openSettings, title = "Select a Model", isGuest = false }) => {
    const [selectedProvider, setSelectedProvider] = useState(null);
    const { userKeys } = useApiKeys();
    const { addNotification } = useNotification();

    const guestAllowedModelIds = [
        'google/gemini-1.5-flash-latest', 'openai/gpt-4.1-nano', 'mistralai/mistral-7b-instruct:free', 'mistralai/devstral-small:free'
    ];

    const handleSelect = (model) => {
        onSelectModel(model.id);
        onClose();
    };
    
    const handleLockedClick = () => {
        let requiredKey = 'OpenRouter';
        if (selectedProvider?.name === 'Google') {
            requiredKey = 'Google';
        }
        addNotification(`${requiredKey} API key required for this model.`, 'warning');
        onClose();
        setTimeout(() => openSettings(), 150);
    }
    
    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
                        <Dialog.Panel as={motion.div} className="w-full max-w-3xl transform text-left align-middle transition-all">
                            <GlassPanel className="p-4 rounded-t-xl sm:rounded-xl flex flex-row h-[70vh]">
                                {/* Left Panel: Providers */}
                                <div className="w-1/3 border-r border-black/10 dark:border-white/10 pr-4 space-y-2 overflow-y-auto custom-scrollbar">
                                    <h3 className="px-2 pb-2 text-sm font-semibold text-slate-800 dark:text-gray-200">Providers</h3>
                                    {modelCategories
                                        .filter(category => !isGuest || category.models.some(m => guestAllowedModelIds.includes(m.id)))
                                        .map(category => (
                                        <button 
                                            key={category.name} 
                                            onClick={() => setSelectedProvider(category)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${selectedProvider?.name === category.name ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                        >
                                            <span className="w-5 h-5">{category.logo}</span>
                                            <span className="font-medium text-slate-700 dark:text-gray-300">{category.name}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Right Panel: Models */}
                                <div className="flex-1 pl-4 relative overflow-hidden">
                                    <AnimatePresence>
                                        {selectedProvider && (
                                            <motion.div
                                                key={selectedProvider.name}
                                                initial={{ x: 50, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -50, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {selectedProvider.models
                                                        .filter(model => !isGuest || guestAllowedModelIds.includes(model.id))
                                                        .map(model => {
                                                        const isLocked = (!model.isFree && !userKeys.openrouter && !model.id.startsWith('google/')) || 
                                                                         (!model.isFree && model.id.startsWith('google/') && !userKeys.google);
                                                        return (
                                                            <ModelCard 
                                                                key={model.id}
                                                                model={{...model, provider: selectedProvider.name, providerLogo: selectedProvider.logo }}
                                                                isSelected={currentModelId === model.id}
                                                                onSelect={() => handleSelect(model)}
                                                                isLocked={isLocked}
                                                                onLockClick={handleLockedClick}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {!selectedProvider && (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-gray-400">
                                            <p>Select a provider to see models</p>
                                        </div>
                                    )}
                                </div>
                            </GlassPanel>
                            <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-gray-200 flex-1 text-center">
                                {selectedProvider ? selectedProvider.name : title}
                            </Dialog.Title>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default HierarchicalModelSelector; 