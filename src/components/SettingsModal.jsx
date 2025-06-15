import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { X } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const { userKeys, updateApiKey } = useApiKeys();
    const [geminiKey, setGeminiKey] = useState(userKeys.gemini || '');

    const handleSave = () => {
        updateApiKey('gemini', geminiKey);
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-800">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                                    API Key Settings
                                </Dialog.Title>
                                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                                    <X size={20} className="text-gray-500" />
                                </button>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Provide your own API keys to use your personal models. Keys are stored securely in your browser's local storage and are never sent to our servers.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <label htmlFor="gemini-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Google Gemini API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="gemini-key"
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SettingsModal;