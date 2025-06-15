import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { User, Sparkles, Pencil, Check, X, Trash2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';

const ChatMessage = ({
    id, text, sender, editCount, imageUrl, usedWebSearch,
    handleUpdateMessage, handleDeleteMessage, onImageClick
}) => {
    const isUser = sender === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

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
    }

    return (
        <motion.div
            className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            layout
        >
            {!isUser && (<div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-purple-200 dark:bg-purple-900/50"> <Sparkles size={18} className="text-purple-600 dark:text-purple-400" /> </div>)}

            <div className="max-w-2xl">
                {isEditing ? (
                    <GlassPanel className="p-1 rounded-br-none">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent px-3 py-2 text-md text-slate-700 dark:text-white focus:outline-none resize-y"
                            rows={Math.max(3, editText.split('\n').length)}
                            autoFocus
                        />
                        <div className="flex justify-between items-center p-2">
                            <span className="text-xs text-slate-500 dark:text-gray-400 pl-1">Ctrl+Enter to save, Esc to cancel</span>
                            <div className="flex gap-2">
                               <button onClick={handleCancel} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500"> <X size={18} /> </button>
                               <button onClick={handleSave} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"> <Check size={18} /> </button>
                            </div>
                        </div>
                    </GlassPanel>
                ) : (
                    <div className="group flex flex-col items-end">
                        {/* Make image clickable */}
                        {imageUrl && (
                            <div className="mb-2 w-48 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onImageClick(imageUrl)}>
                                <GlassPanel className="p-1">
                                    <img src={imageUrl} alt="User upload" className="rounded-md w-full h-auto" />
                                </GlassPanel>
                            </div>
                        )}
                        <GlassPanel className="p-1 rounded-br-none w-full">
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
                        </GlassPanel>

                        <div className="flex items-center justify-end gap-3 h-6 pr-1 pt-1">
                            {/* Show badge if the message permanently used web search */}
                            {isUser && usedWebSearch && (
                                <div className="flex items-center gap-1.5 text-xs text-blue-400">
                                    <Globe size={13} />
                                    <span>Web</span>
                                </div>
                            )}

                            {/* Existing Metadata Controls */}
                            {isUser && (
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {editCount > 0 && (
                                        <span className="text-xs text-slate-500 dark:text-gray-500 italic">
                                            (edited)
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(id)}
                                        className="text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isUser && (<div className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-200 dark:bg-blue-900/50"> <User size={18} className="text-blue-600 dark:text-blue-400" /> </div>)}
        </motion.div>
    );
};

export default ChatMessage;