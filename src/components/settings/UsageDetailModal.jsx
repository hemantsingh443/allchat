import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { modelCategories } from '../../data/models';

const UsageDetailModal = ({ isOpen, onClose, title, chats, onChatClick }) => {
    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={React.Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900 dark:text-gray-100">
                                    {title}
                                </Dialog.Title>
                                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <X size={20} className="text-slate-500" />
                                </button>
                                <div className="mt-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="space-y-2">
                                        {chats && chats.length > 0 ? (
                                            chats.map(chat => {
                                                const providersToInvert = ['OpenAI', 'xAI', 'Kimi', 'Ollama', 'Community'];
                                                const categoryInfo = modelCategories.find(c => c.models.some(m => m.id === chat.modelId));
                                                return (
                                                    <div
                                                        key={chat.id}
                                                        onClick={() => onChatClick(chat.id)}
                                                        className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/40"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-5 h-5 flex-shrink-0 text-slate-800 dark:text-white ${providersToInvert.includes(categoryInfo?.name) ? 'dark:invert' : ''}`}>
                                                                {categoryInfo?.logo}
                                                            </span>
                                                            <p className="text-sm text-slate-700 dark:text-gray-300 truncate">{chat.title}</p>
                                                        </div>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{new Date(chat.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <p className="text-sm text-slate-500">No chats to display.</p>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UsageDetailModal; 