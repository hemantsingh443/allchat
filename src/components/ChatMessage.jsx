import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { User, Sparkles, Pencil, Check, X, Trash2, Globe, ChevronDown, GitBranch, Brain, Eye, Code, Copy, Maximize2, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';
import BranchModelSelector from './BranchModelSelector';
import { allModels } from '../data/models';
import SearchResults from './SearchResults';

const CapabilityIcons = ({ capabilities = {} }) => (
    <div className="flex items-center gap-2 text-slate-400">
        {capabilities.vision && <Eye size={14} className="text-green-400" title="Vision Enabled" />}
        {capabilities.reasoning && <Brain size={14} className="text-purple-400" title="Advanced Reasoning" />}
        {capabilities.code && <Code size={14} className="text-orange-400" title="Code Generation" />}
    </div>
);

const PlainTextCopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy message"
            className="p-1 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );
};

const ChatMessage = ({
    id, text, sender, editCount, imageUrl, usedWebSearch, modelId,
    handleUpdateMessage, handleDeleteMessage, onImageClick,
    handleRegenerate, handleBranch,
    searchResults,
}) => {
    const isUser = sender === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [showRegenModelSelector, setShowRegenModelSelector] = useState(false);
    const [showBranchModelSelector, setShowBranchModelSelector] = useState(false);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const modelDetails = allModels.find(m => m.id === modelId);
    const isAI = sender === 'ai';
    const hasSearchResults = isAI && searchResults;

    const handleSave = async () => {
        if (editText.trim() === text.trim() || editText.trim() === '') {
            setIsEditing(false);
            return;
        }
        await handleUpdateMessage(id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(text);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <motion.div
            className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            layout
        >
            {!isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-purple-200 dark:bg-purple-900/50">
                    <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
            )}

            {/* Change: Removed 'w-full' to allow bubbles to fit their content */}
            <div className="group relative max-w-2xl">
                {imageUrl && !isEditing && (
                    <div
                        className="mb-2 relative group/image"
                        onMouseEnter={() => setIsHoveringImage(true)}
                        onMouseLeave={() => setIsHoveringImage(false)}
                    >
                        <GlassPanel className="p-1 rounded-lg overflow-hidden">
                            <div className="relative">
                                <img
                                    src={imageUrl}
                                    alt="User upload"
                                    className="rounded-md w-48 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => onImageClick(imageUrl)}
                                />
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isHoveringImage ? 1 : 0 }}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center"
                                >
                                    <button
                                        onClick={() => onImageClick(imageUrl)}
                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                        title="View full size"
                                    >
                                        <Maximize2 size={20} />
                                    </button>
                                </motion.div>
                            </div>
                        </GlassPanel>
                    </div>
                )}

                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-3"
                    >
                        <GlassPanel className="p-1 w-full" style={{ borderRadius: isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0' }}>
                            <div className="px-3 py-1">
                                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-gray-200">
                                    <div className="p-1.5 rounded-lg bg-white/20 dark:bg-gray-700/40">
                                        <Edit size={14} />
                                    </div>
                                    <span className="font-medium text-sm">Edit Message</span>
                                </div>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent text-slate-800 dark:text-gray-100 focus:outline-none resize-none border-none placeholder-slate-500 dark:placeholder-gray-400"
                                    rows={Math.max(3, editText.split('\n').length)}
                                    autoFocus
                                    placeholder="Type your message..."
                                />
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 dark:border-gray-700/30">
                                    <span className="text-xs text-slate-600 dark:text-gray-400">
                                        Press Ctrl+Enter to save • Esc to cancel
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="p-2 rounded-full bg-gradient-to-r from-blue-500/80 to-sky-500/80 hover:from-blue-600/80 hover:to-sky-600/80 text-white transition-all duration-150 shadow-lg backdrop-blur-sm border border-blue-400/30"
                                            title="Save"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>
                ) : (
                    <div> {/* Wrapper for display mode */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                            <GlassPanel className="p-1" style={{ borderRadius: isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0' }}>
                                <div className="prose prose-sm prose-slate dark:prose-invert prose-p:my-2 prose-headings:my-3 max-w-none px-3 py-1 text-slate-800 dark:text-white">
                                    <ReactMarkdown
                                        children={text}
                                        components={{
                                            pre: ({ node, ...props }) => {
                                                const codeNode = node.children[0];
                                                if (codeNode && codeNode.tagName === 'code') {
                                                    const codeString = String(codeNode.children[0].value).replace(/\n$/, '');
                                                    return (
                                                        <div className="relative">
                                                            <CopyButton textToCopy={codeString} />
                                                            <pre {...props} className="bg-slate-800/50 rounded-lg" />
                                                        </div>
                                                    );
                                                }
                                                return <pre {...props} />;
                                            },
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        wrapLongLines={true}
                                                        codeTagProps={{ style: { fontFamily: 'inherit' } }}
                                                        {...props}
                                                    />
                                                ) : (
                                                    <code className="bg-slate-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md font-medium" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    />
                                </div>

                                {hasSearchResults && showSearchResults && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="px-3 pb-2 pt-2 mt-2 border-t border-white/10 dark:border-slate-700/50"
                                    >
                                        <SearchResults results={searchResults} />
                                    </motion.div>
                                )}

                                {isAI && text && (
                                    <div className="px-3 pb-2 pt-2 mt-2 border-t border-white/10 dark:border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <BranchModelSelector
                                                        isOpen={showRegenModelSelector}
                                                        onSelect={(newModelId) => { handleRegenerate(id, newModelId); setShowRegenModelSelector(false); }}
                                                        onCancel={() => setShowRegenModelSelector(false)}
                                                        title="Regenerate with"
                                                        currentModelId={modelId}
                                                    />
                                                    <button onClick={() => setShowRegenModelSelector(s => !s)} className="text-xs flex items-center gap-1 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors" title="Regenerate response">
                                                        <span>via {modelDetails?.name || 'a model'}</span>
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                                {modelDetails?.capabilities && <CapabilityIcons capabilities={modelDetails.capabilities} />}
                                                
                                                {/* Change: Updated search results button */}
                                                {hasSearchResults && (
                                                    <button
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors duration-150 border ${
                                                            showSearchResults
                                                                ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300'
                                                                : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                        title={showSearchResults ? 'Hide search results' : 'View results'}
                                                        onClick={() => setShowSearchResults((v) => !v)}
                                                    >
                                                        <Globe size={13} />
                                                        <span>{showSearchResults ? 'Hide results' : 'View results'}</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                <PlainTextCopyButton textToCopy={text} />
                                                <div className="relative">
                                                    <BranchModelSelector
                                                        isOpen={showBranchModelSelector}
                                                        onSelect={(newModelId) => { handleBranch(id, newModelId); setShowBranchModelSelector(false); }}
                                                        onCancel={() => setShowBranchModelSelector(false)}
                                                        title="Branch with"
                                                        currentModelId={modelId}
                                                    />
                                                    <button onClick={() => setShowBranchModelSelector(s => !s)} className="p-1 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200" title="Branch into new chat">
                                                        <GitBranch size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </GlassPanel>
                        </motion.div>

                        {isUser && (
                            <div className="flex items-center justify-end gap-3 h-8 pr-1 pt-1.5 -mr-1">
                                {usedWebSearch && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 opacity-80">
                                        <Globe size={13} />
                                        <span>Web</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    {editCount > 0 && (
                                        <span className="text-xs text-slate-500 dark:text-gray-500 italic">
                                            (edited)
                                        </span>
                                    )}
                                    <button onClick={() => { setEditText(text); setIsEditing(true); }} className="p-1 rounded-full text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Edit message">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteMessage(id)} className="p-1 rounded-full text-slate-500 hover:text-red-500 dark:hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete message">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-200 dark:bg-blue-900/50">
                    <User size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
            )}
        </motion.div>
    );
};

export default ChatMessage;